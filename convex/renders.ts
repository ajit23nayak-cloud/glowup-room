import { mutation, query, internalMutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";

export const create = mutation({
  args: {
    signupId: v.id("signups"),
    beforeStorageId: v.id("_storage"),
    style: v.string(),
    budget: v.string(),
  },
  handler: async (ctx, args) => {
    // Atomically acquire a render slot — fuses the paywall gate (rendersCompleted
    // >= 1 && !paidActive) with the in-progress race guard (rendersInProgress > 0).
    const slot = await ctx.runMutation(internal.signups.tryAcquireRenderSlot, {
      id: args.signupId,
    });
    if (!slot.ok) {
      if (slot.code === "in_progress") {
        throw new ConvexError({
          code: "render_in_progress",
          message: "A render is already running on your account. Wait for it to finish.",
        });
      }
      // paywall
      throw new ConvexError({
        code: "paywall",
        upgradeUrl: "/upgrade",
        rendersCompleted: slot.rendersCompleted,
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
    const wasFailed = render.status === "failed";
    const completed = status === "complete" || status === "failed";
    const clearOnRetry =
      status === "processing"
        ? { errorMessage: undefined, afterImageUrl: undefined }
        : {};
    await ctx.db.patch(id, {
      status,
      ...clearOnRetry,
      ...patch,
      ...(completed ? { completedAt: Date.now() } : {}),
    });

    // First successful complete bumps the signup's rendersCompleted (locks the
    // free render). Subsequent completes (e.g. retries that already succeeded)
    // are no-ops thanks to the wasComplete guard.
    if (status === "complete" && !wasComplete && render.signupId) {
      const signup = await ctx.db.get(render.signupId);
      if (signup) {
        await ctx.db.patch(render.signupId, {
          rendersCompleted: (signup.rendersCompleted ?? 0) + 1,
        });
      }
    }

    // Track failed attempts to cap retries at 3 in the gallery UI.
    if (status === "failed" && !wasFailed && render.signupId) {
      const signup = await ctx.db.get(render.signupId);
      if (signup) {
        await ctx.db.patch(render.signupId, {
          failedRenderAttempts: (signup.failedRenderAttempts ?? 0) + 1,
        });
      }
    }

    // Release the in-progress slot when the render leaves the pending/processing
    // states. Guard against double-release on transitions complete→complete or
    // failed→failed (idempotent setStatus calls).
    const leftInProgress =
      (status === "complete" && !wasComplete) ||
      (status === "failed" && !wasFailed);
    if (leftInProgress && render.signupId) {
      await ctx.runMutation(internal.signups.releaseRenderSlot, {
        id: render.signupId,
      });
    }
  },
});
