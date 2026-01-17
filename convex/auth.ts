import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

// Create or update user after OAuth
export const upsertUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    image: v.optional(v.string()),
    splitwiseId: v.string(),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_splitwiseId", (q) => q.eq("splitwiseId", args.splitwiseId))
      .unique();

    let userId: Id<"users">;
    if (existing) {
      // Update existing user
      await ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name,
        image: args.image,
      });
      userId = existing._id;

      // Update account tokens
      const account = await ctx.db
        .query("accounts")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .first();
      if (account) {
        await ctx.db.patch(account._id, {
          accessToken: args.accessToken,
          refreshToken: args.refreshToken,
        });
      }
    } else {
      // Create new user
      userId = await ctx.db.insert("users", {
        email: args.email,
        name: args.name,
        image: args.image,
        splitwiseId: args.splitwiseId,
      });

      // Create account with tokens
      await ctx.db.insert("accounts", {
        userId,
        provider: "splitwise",
        accessToken: args.accessToken,
        refreshToken: args.refreshToken,
      });
    }

    return userId;
  },
});

// Create a new session
export const createSession = mutation({
  args: {
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("sessions", args);
  },
});

// Get session by token
export const getSessionByToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!session) return null;
    if (session.expiresAt < Date.now()) return null;

    const user = await ctx.db.get(session.userId);
    if (!user) return null;

    return { session, user };
  },
});

// Delete session (logout)
export const deleteSession = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});

// Get access token for API calls
export const getAccessToken = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const account = await ctx.db
      .query("accounts")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    return account?.accessToken ?? null;
  },
});
