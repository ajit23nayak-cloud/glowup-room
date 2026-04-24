import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  signups: defineTable({
    email: v.string(),
    createdAt: v.number(),
    source: v.union(v.literal("landing"), v.literal("try")),
    rendersCompleted: v.optional(v.number()),
    failedRenderAttempts: v.optional(v.number()),
    paidTier: v.optional(v.boolean()),
    paidTierExpiresAt: v.optional(v.number()),
  }).index("by_email", ["email"]),

  payments: defineTable({
    email: v.string(),
    signupId: v.id("signups"),
    utr: v.string(),
    amount: v.number(),
    status: v.union(
      v.literal("pending_verification"),
      v.literal("verified"),
      v.literal("rejected"),
    ),
    submittedAt: v.number(),
    verifiedAt: v.optional(v.number()),
    rejectedAt: v.optional(v.number()),
    adminNote: v.optional(v.string()),
  })
    .index("by_status_submittedAt", ["status", "submittedAt"])
    .index("by_utr", ["utr"])
    .index("by_email", ["email"]),

  renders: defineTable({
    signupId: v.id("signups"),
    beforeStorageId: v.id("_storage"),
    style: v.string(),
    budget: v.string(),
    status: v.union(
      v.literal("pending"),
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
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  }).index("by_status_createdAt", ["status", "createdAt"]),
});
