import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { ConvexError, v } from "convex/values";

const DAY_MS = 24 * 60 * 60 * 1000;

function assertAdmin(secret: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new ConvexError({ code: "admin_not_configured" });
  if (secret !== expected) throw new ConvexError({ code: "unauthorized" });
}

/**
 * User-facing: paste a 12-digit UTR after paying via UPI.
 * Provisionally flips paidTier=true for 24h pending admin review.
 * Blocks duplicate UTRs (same UTR on a different email would be fraud).
 */
export const submitUTR = mutation({
  args: {
    email: v.string(),
    utr: v.string(),
  },
  handler: async (ctx, { email, utr }) => {
    const cleanUtr = utr.trim();
    if (!/^\d{12}$/.test(cleanUtr)) {
      throw new ConvexError({ code: "invalid_utr", message: "UTR must be exactly 12 digits." });
    }

    // Dedup — same UTR used by another email that isn't already rejected?
    const dupes = await ctx.db
      .query("payments")
      .withIndex("by_utr", (q) => q.eq("utr", cleanUtr))
      .collect();
    const activeDupe = dupes.find((p) => p.status !== "rejected" && p.email !== email);
    if (activeDupe) {
      throw new ConvexError({
        code: "utr_reused",
        message: "This UTR has already been submitted by a different email. If you believe this is a mistake, please contact support.",
      });
    }

    // Find or create the signup
    let signup = await ctx.db
      .query("signups")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (!signup) {
      const id = await ctx.db.insert("signups", {
        email,
        source: "try",
        createdAt: Date.now(),
      });
      signup = await ctx.db.get(id);
      if (!signup) throw new ConvexError({ code: "signup_create_failed" });
    }

    // If this same email already has a pending UTR, update instead of duplicating.
    const existingForEmail = dupes.find((p) => p.email === email);
    const now = Date.now();
    const paymentId =
      existingForEmail && existingForEmail.status === "pending_verification"
        ? existingForEmail._id
        : await ctx.db.insert("payments", {
            email,
            signupId: signup._id,
            utr: cleanUtr,
            amount: 99,
            status: "pending_verification",
            submittedAt: now,
          });

    // Provisionally flip paid tier to unlock renders immediately.
    await ctx.db.patch(signup._id, {
      paidTier: true,
      paidTierExpiresAt: now + DAY_MS,
    });

    // Best-effort confirmation email. Schedule on the side so a Resend hiccup
    // never blocks the user's activation.
    await ctx.scheduler.runAfter(0, internal.emails.sendUtrConfirmation, {
      email,
    });

    return { paymentId, signupId: signup._id, expiresAt: now + DAY_MS };
  },
});

/** Admin: list pending UTRs for review. */
export const listPending = query({
  args: { adminSecret: v.string() },
  handler: async (ctx, { adminSecret }) => {
    assertAdmin(adminSecret);
    const pending = await ctx.db
      .query("payments")
      .withIndex("by_status_submittedAt", (q) => q.eq("status", "pending_verification"))
      .order("desc")
      .take(100);
    return pending;
  },
});

/** Admin: list verified/rejected for audit. */
export const listRecent = query({
  args: { adminSecret: v.string() },
  handler: async (ctx, { adminSecret }) => {
    assertAdmin(adminSecret);
    const all = await ctx.db.query("payments").order("desc").take(50);
    return all;
  },
});

export const verifyPayment = mutation({
  args: {
    adminSecret: v.string(),
    paymentId: v.id("payments"),
    note: v.optional(v.string()),
  },
  handler: async (ctx, { adminSecret, paymentId, note }) => {
    assertAdmin(adminSecret);
    const p = await ctx.db.get(paymentId);
    if (!p) throw new ConvexError({ code: "not_found" });
    const now = Date.now();
    await ctx.db.patch(paymentId, {
      status: "verified",
      verifiedAt: now,
      adminNote: note,
    });
    // Extend paidTier from verification time (not submission time)
    await ctx.db.patch(p.signupId, {
      paidTier: true,
      paidTierExpiresAt: now + DAY_MS,
    });
  },
});

export const rejectPayment = mutation({
  args: {
    adminSecret: v.string(),
    paymentId: v.id("payments"),
    note: v.optional(v.string()),
  },
  handler: async (ctx, { adminSecret, paymentId, note }) => {
    assertAdmin(adminSecret);
    const p = await ctx.db.get(paymentId);
    if (!p) throw new ConvexError({ code: "not_found" });
    await ctx.db.patch(paymentId, {
      status: "rejected",
      rejectedAt: Date.now(),
      adminNote: note,
    });
    // Revoke paidTier — if the signup has another verified payment still active,
    // leave it alone; otherwise flip off.
    const otherActive = await ctx.db
      .query("payments")
      .withIndex("by_email", (q) => q.eq("email", p.email))
      .filter((q) =>
        q.and(
          q.neq(q.field("_id"), paymentId),
          q.or(
            q.eq(q.field("status"), "verified"),
            q.eq(q.field("status"), "pending_verification"),
          ),
        ),
      )
      .first();
    if (!otherActive) {
      await ctx.db.patch(p.signupId, {
        paidTier: false,
        paidTierExpiresAt: undefined,
      });
    }
  },
});
