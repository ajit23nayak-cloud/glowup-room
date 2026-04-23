import { mutation, query } from "./_generated/server";
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
