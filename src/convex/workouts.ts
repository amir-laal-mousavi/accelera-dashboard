import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const workouts = await ctx.db
      .query("workoutLogs")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    if (args.startDate && args.endDate) {
      return workouts.filter((w) => w.date >= args.startDate! && w.date <= args.endDate!);
    }

    return workouts;
  },
});

export const create = mutation({
  args: {
    date: v.number(),
    session: v.string(),
    exercise: v.string(),
    sets: v.optional(v.number()),
    repsPerSet: v.optional(v.number()),
    weight: v.optional(v.number()),
    duration: v.optional(v.number()),
    calories: v.optional(v.number()),
    intensity: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("workoutLogs", {
      userId,
      ...args,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("workoutLogs") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const workout = await ctx.db.get(args.id);
    if (!workout || workout.userId !== userId) {
      throw new Error("Workout not found or unauthorized");
    }

    await ctx.db.delete(args.id);
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

    const workouts = await ctx.db
      .query("workoutLogs")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    const filtered = workouts.filter((w) => w.date >= args.startDate && w.date <= args.endDate);

    const totalMinutes = filtered.reduce((sum, w) => sum + (w.duration || 0), 0);
    const totalCalories = filtered.reduce((sum, w) => sum + (w.calories || 0), 0);
    const totalSessions = filtered.length;

    return {
      totalMinutes,
      totalCalories,
      totalSessions,
      workouts: filtered,
    };
  },
});
