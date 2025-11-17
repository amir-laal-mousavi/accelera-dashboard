import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Water logs
export const listWater = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const logs = await ctx.db
      .query("waterLogs")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    if (args.startDate && args.endDate) {
      return logs.filter((log) => log.dateTime >= args.startDate! && log.dateTime <= args.endDate!);
    }

    return logs;
  },
});

export const addWater = mutation({
  args: {
    dateTime: v.number(),
    amount: v.number(),
    goal: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("waterLogs", {
      userId,
      ...args,
    });
  },
});

// Caffeine logs
export const listCaffeine = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const logs = await ctx.db
      .query("caffeineLogs")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    if (args.startDate && args.endDate) {
      return logs.filter((log) => log.dateTime >= args.startDate! && log.dateTime <= args.endDate!);
    }

    return logs;
  },
});

export const addCaffeine = mutation({
  args: {
    dateTime: v.number(),
    drink: v.string(),
    type: v.string(),
    volume: v.number(),
    caffeine: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("caffeineLogs", {
      userId,
      ...args,
    });
  },
});

// Sleep logs
export const listSleep = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const logs = await ctx.db
      .query("sleepLogs")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    if (args.startDate && args.endDate) {
      return logs.filter((log) => log.date >= args.startDate! && log.date <= args.endDate!);
    }

    return logs;
  },
});

export const addSleep = mutation({
  args: {
    date: v.number(),
    duration: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("sleepLogs", {
      userId,
      ...args,
    });
  },
});

// Weight logs
export const listWeight = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("weightLogs")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const addWeight = mutation({
  args: {
    date: v.number(),
    weight: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("weightLogs", {
      userId,
      ...args,
    });
  },
});
