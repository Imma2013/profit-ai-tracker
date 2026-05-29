import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  analyses: defineTable({
    trend: v.optional(v.string()),
    signal: v.optional(v.string()),
    riskLevel: v.optional(v.string()),
    volume: v.optional(v.string()),
    supportLevel: v.optional(v.string()),
    resistanceLevel: v.optional(v.string()),
    overview: v.optional(v.string()),
    entryExitStrategy: v.optional(v.string()),
    riskRewardAssessment: v.optional(v.string()),
    tradeDuration: v.optional(v.string()),
    technicalIndicators: v.optional(v.string()),
    recognizedPatterns: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    userId: v.string(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});
