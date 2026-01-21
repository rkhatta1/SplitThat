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
    items: v.optional(v.string()),
    userShares: v.optional(v.string()),
    tax: v.optional(v.number()),
    tip: v.optional(v.number()),
    participants: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("splits", args);
  },
});

export const getRecentSplits = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Get the user to find their splitwiseId
    const user = await ctx.db.get(args.userId);
    const splitwiseId = user?.splitwiseId;

    // Get splits created by the user
    const ownedSplits = await ctx.db
      .query("splits")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(20);

    // Get all recent splits and filter for ones where user is a participant
    // (Convex doesn't support array contains queries directly, so we filter in memory)
    const allRecentSplits = await ctx.db
      .query("splits")
      .order("desc")
      .take(100);

    const participantSplits = splitwiseId
      ? allRecentSplits.filter(
          (split) =>
            split.userId !== args.userId &&
            split.participants?.includes(splitwiseId)
        )
      : [];

    // Merge and dedupe
    const allSplits = [...ownedSplits, ...participantSplits];
    const seen = new Set<string>();
    const uniqueSplits = allSplits.filter((split) => {
      if (seen.has(split._id)) return false;
      seen.add(split._id);
      return true;
    });

    // Sort by creation time (desc) and take top 10
    return uniqueSplits
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, 10);
  },
});

export const getSplitById = query({
  args: { id: v.id("splits") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const updateSplit = mutation({
  args: {
    id: v.id("splits"),
    amount: v.optional(v.number()),
    description: v.optional(v.string()),
    items: v.optional(v.string()),
    userShares: v.optional(v.string()),
    tax: v.optional(v.number()),
    tip: v.optional(v.number()),
    participants: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    return await ctx.db.patch(id, filteredUpdates);
  },
});

export const deleteSplit = mutation({
  args: { id: v.id("splits") },
  handler: async (ctx, args) => {
    // Note: We do NOT delete the receiptCache entry - we keep the hash
    await ctx.db.delete(args.id);
    return { success: true };
  },
});
