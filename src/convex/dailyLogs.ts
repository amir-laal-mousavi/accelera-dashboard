import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { moodValidator } from "./schema";

export const list = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const logs = await ctx.db
      .query("dailyLogs")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    if (args.startDate && args.endDate) {
      return logs.filter((log) => log.date >= args.startDate! && log.date <= args.endDate!);
    }

    return logs;
  },
});

export const getByDate = query({
  args: { date: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const logs = await ctx.db
      .query("dailyLogs")
      .withIndex("userId_date", (q) => q.eq("userId", userId).eq("date", args.date))
      .collect();

    return logs[0] || null;
  },
});

export const create = mutation({
  args: {
    date: v.number(),
    mood: v.optional(moodValidator),
    caloriesBurned: v.optional(v.number()),
    notes: v.optional(v.string()),
    productivityScore: v.optional(v.number()),
    healthScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("dailyLogs", {
      userId,
      ...args,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("dailyLogs"),
    mood: v.optional(moodValidator),
    caloriesBurned: v.optional(v.number()),
    notes: v.optional(v.string()),
    productivityScore: v.optional(v.number()),
    healthScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { id, ...updates } = args;
    const log = await ctx.db.get(id);
    
    if (!log || log.userId !== userId) {
      throw new Error("Log not found or unauthorized");
    }

    await ctx.db.patch(id, updates);
  },
});

export const getStats = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const logs = await ctx.db
      .query("dailyLogs")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    const filtered = logs.filter((log) => log.date >= args.startDate && log.date <= args.endDate);

    const avgProductivity = filtered.reduce((sum, log) => sum + (log.productivityScore || 0), 0) / (filtered.length || 1);
    const avgHealth = filtered.reduce((sum, log) => sum + (log.healthScore || 0), 0) / (filtered.length || 1);

    return {
      totalDays: filtered.length,
      avgProductivity,
      avgHealth,
      logs: filtered,
    };
  },
});
