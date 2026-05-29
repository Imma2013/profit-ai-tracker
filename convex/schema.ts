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
    storageId: v.optional(v.id("_storage")),
    userId: v.string(),
    createdAt: v.number(),
  }),
});
