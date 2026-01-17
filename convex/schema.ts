import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Auth tables
  users: defineTable({
    email: v.string(),
    name: v.string(),
    image: v.optional(v.string()),
    splitwiseId: v.string(),
  }).index("by_email", ["email"])
    .index("by_splitwiseId", ["splitwiseId"]),

  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
  }).index("by_token", ["token"]),

  // Store OAuth tokens
  accounts: defineTable({
    userId: v.id("users"),
    provider: v.string(),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
  }).index("by_userId", ["userId"]),

  // App tables
  splits: defineTable({
    userId: v.id("users"),
    amount: v.number(),
    description: v.string(),
    date: v.string(),
    splitwiseId: v.optional(v.string()),
    type: v.union(v.literal("manual"), v.literal("auto")),
    status: v.union(v.literal("pending"), v.literal("synced")),
    groupId: v.optional(v.string()),
  }).index("by_userId", ["userId"]),

  receipts: defineTable({
    splitId: v.id("splits"),
    storageId: v.string(),
    extractedText: v.optional(v.string()),
    jsonOutput: v.optional(v.string()),
  }).index("by_splitId", ["splitId"]),
});
