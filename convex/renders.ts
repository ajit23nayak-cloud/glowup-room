import { mutation, query, internalMutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";

export const create = mutation({
  args: {
    signupId: v.id("signups"),
    beforeStorageId: v.id("_storage"),
    style: v.string(),
    budget: v.string(),
  },
  handler: async (ctx, args) => {
    // Paywall gate — 1 free successful render per email.
    const signup = await ctx.db.get(args.signupId);
    if (!signup) throw new ConvexError({ code: "signup_missing" });
    const rendersCompleted = signup.rendersCompleted ?? 0;
    const paidTier = signup.paidTier ?? false;
    const expiresAt = signup.paidTierExpiresAt;
    const paidActive = paidTier && (!expiresAt || expiresAt > Date.now());
    if (rendersCompleted >= 1 && !paidActive) {
      throw new ConvexError({
        code: "paywall",
        upgradeUrl: "/upgrade",
        rendersCompleted,
      });
    }
    return await ctx.db.insert("renders", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const getById = query({
  args: { id: v.id("renders") },
  handler: async (ctx, { id }) => {
    const r = await ctx.db.get(id);
    if (!r) return null;
    const beforeUrl = await ctx.storage.getUrl(r.beforeStorageId);
    const signup = await ctx.db.get(r.signupId);
    const failedRenderAttempts = signup?.failedRenderAttempts ?? 0;
    return { ...r, beforeUrl, failedRenderAttempts };
  },
});

export const setStatus = internalMutation({
  args: {
    id: v.id("renders"),
    status: v.union(
      v.literal("processing"),
      v.literal("complete"),
      v.literal("failed"),
    ),
    replicatePredictionId: v.optional(v.string()),
    afterImageUrl: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    selectedProductIds: v.optional(v.array(v.string())),
    finalPrompt: v.optional(v.string()),
    sofaOmittedForBudget: v.optional(v.boolean()),
    minSofaPriceINR: v.optional(v.number()),
  },
  handler: async (ctx, { id, status, ...patch }) => {
    const render = await ctx.db.get(id);
    if (!render) return;
    const wasComplete = render.status === "complete";
    const completed = status === "complete" || status === "failed";
    const clearOnRetry = status === "processing" ? { errorMessage: undefined, afterImageUrl: undefined } : {};
    await ctx.db.patch(id, {
      status,
      ...clearOnRetry,
      ...patch,
      ...(completed ? { completedAt: Date.now() } : {}),
    });
    // Only increment the signup's free-render counter on first successful complete.
    if (status === "complete" && !wasComplete && render.signupId) {
      const signup = await ctx.db.get(render.signupId);
      if (signup) {
        await ctx.db.patch(render.signupId, {
          rendersCompleted: (signup.rendersCompleted ?? 0) + 1,
        });
      }
    }
    // Track failed render attempts per signup — protects Replicate budget from
    // runaway retries on a broken render. UI caps retry button at 3.
    if (status === "failed" && render.status !== "failed" && render.signupId) {
      const signup = await ctx.db.get(render.signupId);
      if (signup) {
        await ctx.db.patch(render.signupId, {
          failedRenderAttempts: (signup.failedRenderAttempts ?? 0) + 1,
        });
      }
    }
  },
});
