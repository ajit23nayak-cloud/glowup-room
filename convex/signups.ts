import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const createOrGet = mutation({
  args: {
    email: v.string(),
    source: v.union(v.literal("landing"), v.literal("try")),
  },
  handler: async (ctx, { email, source }) => {
    const existing = await ctx.db
      .query("signups")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (existing) return existing._id;
    return await ctx.db.insert("signups", { email, source, createdAt: Date.now() });
  },
});

export const getById = query({
  args: { id: v.id("signups") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

/**
 * Gate check: can this signup create a new render?
 * Free tier: 1 successful render lifetime.
 * Paid tier: unlimited while paidTierExpiresAt is in the future.
 */
export const getGate = query({
  args: { id: v.id("signups") },
  handler: async (ctx, { id }) => {
    const s = await ctx.db.get(id);
    if (!s) return { allowed: false, reason: "signup_missing" as const, rendersCompleted: 0, paidActive: false };
    const rendersCompleted = s.rendersCompleted ?? 0;
    const paidTier = s.paidTier ?? false;
    const expiresAt = s.paidTierExpiresAt;
    const paidActive = paidTier && (!expiresAt || expiresAt > Date.now());
    const allowed = paidActive || rendersCompleted < 1;
    return {
      allowed,
      reason: allowed ? null : ("paywall" as const),
      rendersCompleted,
      paidActive,
    };
  },
});

/** Called from setStatus when a render flips to complete. */
export const bumpRenderCount = internalMutation({
  args: { id: v.id("signups") },
  handler: async (ctx, { id }) => {
    const s = await ctx.db.get(id);
    if (!s) return;
    await ctx.db.patch(id, { rendersCompleted: (s.rendersCompleted ?? 0) + 1 });
  },
});
