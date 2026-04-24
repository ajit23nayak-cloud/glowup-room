import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    signupId: v.id("signups"),
    beforeStorageId: v.id("_storage"),
    style: v.string(),
    budget: v.string(),
  },
  handler: async (ctx, args) =>
    await ctx.db.insert("renders", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    }),
});

export const getById = query({
  args: { id: v.id("renders") },
  handler: async (ctx, { id }) => {
    const r = await ctx.db.get(id);
    if (!r) return null;
    const beforeUrl = await ctx.storage.getUrl(r.beforeStorageId);
    return { ...r, beforeUrl };
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
    const completed = status === "complete" || status === "failed";
    const clearOnRetry = status === "processing" ? { errorMessage: undefined, afterImageUrl: undefined } : {};
    await ctx.db.patch(id, {
      status,
      ...clearOnRetry,
      ...patch,
      ...(completed ? { completedAt: Date.now() } : {}),
    });
  },
});
