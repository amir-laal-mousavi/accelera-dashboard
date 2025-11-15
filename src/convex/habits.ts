import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("habits")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    frequency: v.string(),
    targetDays: v.optional(v.number()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("habits", {
      userId,
      ...args,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("habits") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const habit = await ctx.db.get(args.id);
    if (!habit || habit.userId !== userId) {
      throw new Error("Habit not found or unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});

// Habit completions
export const getCompletions = query({
  args: {
    habitId: v.id("habits"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let completions = await ctx.db
      .query("habitCompletions")
      .withIndex("habitId", (q) => q.eq("habitId", args.habitId))
      .collect();

    if (args.startDate && args.endDate) {
      completions = completions.filter((c) => c.date >= args.startDate! && c.date <= args.endDate!);
    }

    return completions;
  },
});

export const toggleCompletion = mutation({
  args: {
    habitId: v.id("habits"),
    date: v.number(),
    completed: v.boolean(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if completion already exists
    const existing = await ctx.db
      .query("habitCompletions")
      .withIndex("habitId_date", (q) => q.eq("habitId", args.habitId).eq("date", args.date))
      .collect();

    if (existing.length > 0) {
      await ctx.db.patch(existing[0]._id, {
        completed: args.completed,
        notes: args.notes,
      });
      return existing[0]._id;
    } else {
      return await ctx.db.insert("habitCompletions", {
        userId,
        habitId: args.habitId,
        date: args.date,
        completed: args.completed,
        notes: args.notes,
      });
    }
  },
});

export const getHabitStats = query({
  args: {
    habitId: v.id("habits"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const completions = await ctx.db
      .query("habitCompletions")
      .withIndex("habitId", (q) => q.eq("habitId", args.habitId))
      .collect();

    const filtered = completions.filter((c) => c.date >= args.startDate && c.date <= args.endDate);
    const completed = filtered.filter((c) => c.completed).length;
    const total = filtered.length;

    // Calculate streak
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const sortedCompletions = [...completions].sort((a, b) => b.date - a.date);
    
    for (const completion of sortedCompletions) {
      if (completion.completed) {
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        if (currentStreak === 0) currentStreak = tempStreak;
        tempStreak = 0;
      }
    }

    if (currentStreak === 0) currentStreak = tempStreak;

    return {
      completed,
      total,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      currentStreak,
      longestStreak,
    };
  },
});
