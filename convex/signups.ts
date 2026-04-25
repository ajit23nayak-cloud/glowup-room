import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { EMAIL_REGEX, normalizeEmail } from "../lib/normalizeEmail";

export const getById = query({
  args: { id: v.id("signups") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

/**
 * Inline paywall query for /try — debounced from the frontend on email blur.
 * Returns one of five statuses so the UI can show the matching banner.
 *
 * Runs on the default isolate. Does NOT do MX checks (that's reserved for the
 * write path in convex/signupsNode.ts).
 */
export const getSignupStatus = query({
  args: { email: v.string() },
  handler: async (
    ctx,
    { email },
  ): Promise<{
    status: "new" | "free_used" | "paid_active" | "paid_expired" | "invalid_format";
    rendersCompleted: number;
    paidTierExpiresAt: number | null;
  }> => {
    const trimmed = email.trim();
    if (!EMAIL_REGEX.test(trimmed)) {
      return {
        status: "invalid_format",
        rendersCompleted: 0,
        paidTierExpiresAt: null,
      };
    }
    const normalized = normalizeEmail(trimmed);
    let s = await ctx.db
      .query("signups")
      .withIndex("by_emailNormalized", (q) => q.eq("emailNormalized", normalized))
      .unique();
    if (!s) {
      // Fall back to raw-email lookup for legacy rows that haven't been backfilled
      s = await ctx.db
        .query("signups")
        .withIndex("by_email", (q) => q.eq("email", trimmed))
        .unique();
    }
    if (!s) {
      return { status: "new", rendersCompleted: 0, paidTierExpiresAt: null };
    }
    const rendersCompleted = s.rendersCompleted ?? 0;
    const paidTier = s.paidTier ?? false;
    const expiresAt = s.paidTierExpiresAt;
    const paidActive = paidTier && (!expiresAt || expiresAt > Date.now());
    if (paidActive) {
      return {
        status: "paid_active",
        rendersCompleted,
        paidTierExpiresAt: expiresAt ?? null,
      };
    }
    if (paidTier && expiresAt && expiresAt <= Date.now()) {
      return {
        status: "paid_expired",
        rendersCompleted,
        paidTierExpiresAt: expiresAt,
      };
    }
    if (rendersCompleted >= 1) {
      return { status: "free_used", rendersCompleted, paidTierExpiresAt: null };
    }
    return { status: "new", rendersCompleted, paidTierExpiresAt: null };
  },
});

/** Internal upsert — find by emailNormalized; backfill legacy rows by email match. */
export const _upsertNormalized = internalMutation({
  args: {
    email: v.string(),
    emailNormalized: v.string(),
    source: v.union(v.literal("landing"), v.literal("try")),
  },
  handler: async (ctx, { email, emailNormalized, source }) => {
    let existing = await ctx.db
      .query("signups")
      .withIndex("by_emailNormalized", (q) => q.eq("emailNormalized", emailNormalized))
      .unique();
    if (!existing) {
      const byRaw = await ctx.db
        .query("signups")
        .withIndex("by_email", (q) => q.eq("email", email))
        .unique();
      if (byRaw) {
        await ctx.db.patch(byRaw._id, { emailNormalized });
        existing = byRaw;
      }
    }
    if (existing) return existing._id;
    return await ctx.db.insert("signups", {
      email,
      emailNormalized,
      source,
      createdAt: Date.now(),
    });
  },
});

/** Internal — called from setStatus when a render flips to complete. */
export const bumpRenderCount = internalMutation({
  args: { id: v.id("signups") },
  handler: async (ctx, { id }) => {
    const s = await ctx.db.get(id);
    if (!s) return;
    await ctx.db.patch(id, { rendersCompleted: (s.rendersCompleted ?? 0) + 1 });
  },
});

/** Admin: reset a signup to free-tier-fresh state. */
export const adminResetByEmail = mutation({
  args: { adminSecret: v.string(), email: v.string() },
  handler: async (ctx, { adminSecret, email }) => {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) throw new ConvexError({ code: "admin_not_configured" });
    if (adminSecret !== expected) throw new ConvexError({ code: "unauthorized" });
    const trimmed = email.trim();
    const normalized = normalizeEmail(trimmed);
    const matches: Array<{ _id: string }> = [];
    const byNorm = await ctx.db
      .query("signups")
      .withIndex("by_emailNormalized", (q) => q.eq("emailNormalized", normalized))
      .collect();
    matches.push(...byNorm);
    const byRaw = await ctx.db
      .query("signups")
      .withIndex("by_email", (q) => q.eq("email", trimmed))
      .collect();
    for (const r of byRaw) if (!matches.find((m) => m._id === r._id)) matches.push(r);
    let resetCount = 0;
    for (const m of matches) {
      await ctx.db.patch(m._id as never, {
        rendersCompleted: 0,
        rendersInProgress: 0,
        failedRenderAttempts: 0,
        paidTier: false,
        paidTierExpiresAt: undefined,
        emailNormalized: normalized,
      });
      resetCount++;
    }
    return { ok: true, resetCount };
  },
});

/** Admin: hard-delete a signup row (for clearly-bogus typos). */
export const adminDeleteByEmail = mutation({
  args: { adminSecret: v.string(), email: v.string() },
  handler: async (ctx, { adminSecret, email }) => {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) throw new ConvexError({ code: "admin_not_configured" });
    if (adminSecret !== expected) throw new ConvexError({ code: "unauthorized" });
    const trimmed = email.trim();
    const normalized = normalizeEmail(trimmed);
    const ids = new Set<string>();
    for (const r of await ctx.db
      .query("signups")
      .withIndex("by_emailNormalized", (q) => q.eq("emailNormalized", normalized))
      .collect()) {
      ids.add(r._id);
    }
    for (const r of await ctx.db
      .query("signups")
      .withIndex("by_email", (q) => q.eq("email", trimmed))
      .collect()) {
      ids.add(r._id);
    }
    let deletedCount = 0;
    for (const id of ids) {
      await ctx.db.delete(id as never);
      deletedCount++;
    }
    return { ok: true, deletedCount };
  },
});

/**
 * Atomically increment rendersInProgress if the gate allows. Called from
 * renders.create to enforce one-at-a-time render serialization on top of the
 * free/paid gate.
 */
export const tryAcquireRenderSlot = internalMutation({
  args: { id: v.id("signups") },
  handler: async (
    ctx,
    { id },
  ): Promise<
    | { ok: true }
    | { ok: false; code: "paywall" | "in_progress"; rendersCompleted: number }
  > => {
    const s = await ctx.db.get(id);
    if (!s) throw new ConvexError({ code: "signup_missing" });
    const rendersCompleted = s.rendersCompleted ?? 0;
    const rendersInProgress = s.rendersInProgress ?? 0;
    const paidTier = s.paidTier ?? false;
    const expiresAt = s.paidTierExpiresAt;
    const paidActive = paidTier && (!expiresAt || expiresAt > Date.now());
    if (rendersInProgress > 0) {
      return { ok: false, code: "in_progress", rendersCompleted };
    }
    if (rendersCompleted >= 1 && !paidActive) {
      return { ok: false, code: "paywall", rendersCompleted };
    }
    await ctx.db.patch(id, { rendersInProgress: rendersInProgress + 1 });
    return { ok: true };
  },
});

/** Internal: called from setStatus when a render leaves the in-progress states. */
export const releaseRenderSlot = internalMutation({
  args: { id: v.id("signups") },
  handler: async (ctx, { id }) => {
    const s = await ctx.db.get(id);
    if (!s) return;
    const next = Math.max(0, (s.rendersInProgress ?? 0) - 1);
    await ctx.db.patch(id, { rendersInProgress: next });
  },
});

export const _getRaw = internalQuery({
  args: { id: v.id("signups") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});
