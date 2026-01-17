import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveSplit = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    description: v.string(),
    date: v.string(),
    type: v.union(v.literal("manual"), v.literal("auto")),
    status: v.union(v.literal("pending"), v.literal("synced")),
    groupId: v.optional(v.string()),
    splitwiseId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("splits", args);
  },
});

export const getRecentSplits = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("splits")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(5);
  },
});
