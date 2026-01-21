import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get cached response by file hash
export const getByHash = query({
  args: { fileHash: v.string() },
  handler: async (ctx, args) => {
    const cached = await ctx.db
      .query("receiptCache")
      .withIndex("by_fileHash", (q) => q.eq("fileHash", args.fileHash))
      .first();

    if (!cached) return null;

    // Return the cached response (parse it since it's stored as JSON string)
    return {
      response: JSON.parse(cached.response),
      createdAt: cached.createdAt,
    };
  },
});

// Store a new cache entry
export const store = mutation({
  args: {
    fileHash: v.string(),
    response: v.string(), // JSON stringified
  },
  handler: async (ctx, args) => {
    // Check if already exists
    const existing = await ctx.db
      .query("receiptCache")
      .withIndex("by_fileHash", (q) => q.eq("fileHash", args.fileHash))
      .first();

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        response: args.response,
        createdAt: Date.now(),
      });
      return existing._id;
    }

    // Create new entry
    return await ctx.db.insert("receiptCache", {
      fileHash: args.fileHash,
      response: args.response,
      createdAt: Date.now(),
    });
  },
});
