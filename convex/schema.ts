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
    userId: v.id("users"), // Creator of the split
    amount: v.number(),
    description: v.string(),
    date: v.string(),
    currency: v.optional(v.string()), // Currency code (USD, EUR, etc.)
    notes: v.optional(v.string()), // User notes/comments
    splitwiseId: v.optional(v.string()),
    type: v.union(v.literal("manual"), v.literal("auto")),
    status: v.union(v.literal("pending"), v.literal("synced")),
    groupId: v.optional(v.string()),
    // Detailed breakdown for itemized splits
    items: v.optional(v.string()), // JSON stringified array of items
    userShares: v.optional(v.string()), // JSON stringified per-user breakdown
    tax: v.optional(v.number()),
    tip: v.optional(v.number()),
    // All participants (Splitwise user IDs as strings) who can view/edit this split
    participants: v.optional(v.array(v.string())),
  }).index("by_userId", ["userId"]),

  receipts: defineTable({
    splitId: v.id("splits"),
    storageId: v.string(),
    extractedText: v.optional(v.string()),
    jsonOutput: v.optional(v.string()),
  }).index("by_splitId", ["splitId"]),

  // Cache for Gemini receipt processing responses
  receiptCache: defineTable({
    fileHash: v.string(),
    response: v.string(), // JSON stringified response
    createdAt: v.number(),
  }).index("by_fileHash", ["fileHash"]),
});
