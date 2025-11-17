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

export const updateWater = mutation({
  args: {
    id: v.id("waterLogs"),
    amount: v.number(),
    goal: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const deleteWater = mutation({
  args: { id: v.id("waterLogs") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.delete(args.id);
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

export const updateCaffeine = mutation({
  args: {
    id: v.id("caffeineLogs"),
    drink: v.string(),
    type: v.string(),
    volume: v.number(),
    caffeine: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const deleteCaffeine = mutation({
  args: { id: v.id("caffeineLogs") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.delete(args.id);
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

export const updateSleep = mutation({
  args: {
    id: v.id("sleepLogs"),
    duration: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const deleteSleep = mutation({
  args: { id: v.id("sleepLogs") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.delete(args.id);
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

export const updateWeight = mutation({
  args: {
    id: v.id("weightLogs"),
    weight: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const deleteWeight = mutation({
  args: { id: v.id("weightLogs") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.delete(args.id);
  },
});
