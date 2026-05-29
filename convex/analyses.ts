import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveAnalysis = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("analyses", {
      ...args,
      createdAt: Date.now(),
    });
    return id;
  },
});

export const getAnalysis = query({
  args: { id: v.id("analyses") },
  handler: async (ctx, args) => {
    const analysis = await ctx.db.get(args.id);
    if (!analysis) return null;
    
    let imageUrl = null;
    if (analysis.storageId) {
      imageUrl = await ctx.storage.getUrl(analysis.storageId);
    }
    
    return { ...analysis, imageUrl };
  },
});

export const getUserAnalyses = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.userId) return [];
    
    const analyses = await ctx.db
      .query("analyses")
      .withIndex("by_user", (q) => q.eq("userId", args.userId!))
      .order("desc")
      .collect();
      
    // Fetch image URLs for all analyses
    return Promise.all(
      analyses.map(async (analysis) => {
        let imageUrl = null;
        if (analysis.storageId) {
          imageUrl = await ctx.storage.getUrl(analysis.storageId);
        }
        return { ...analysis, imageUrl };
      })
    );
  },
});
