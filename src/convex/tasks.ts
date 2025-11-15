import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { taskStatusValidator, taskPriorityValidator, taskAreaValidator } from "./schema";

export const list = query({
  args: {
    scheduled: v.optional(v.number()),
    done: v.optional(v.boolean()),
    area: v.optional(taskAreaValidator),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let tasksQuery = ctx.db
      .query("tasks")
      .withIndex("userId", (q) => q.eq("userId", userId));

    const tasks = await tasksQuery.collect();

    return tasks.filter((task) => {
      if (args.done !== undefined && task.done !== args.done) return false;
      if (args.scheduled !== undefined && task.scheduled !== args.scheduled) return false;
      if (args.area !== undefined && task.area !== args.area) return false;
      return true;
    });
  },
});

export const create = mutation({
  args: {
    task: v.string(),
    status: taskStatusValidator,
    priority: taskPriorityValidator,
    area: taskAreaValidator,
    scheduled: v.optional(v.number()),
    deadline: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("tasks", {
      userId,
      task: args.task,
      status: args.status,
      priority: args.priority,
      area: args.area,
      scheduled: args.scheduled,
      deadline: args.deadline,
      notes: args.notes,
      done: false,
      timeSpent: 0,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    task: v.optional(v.string()),
    status: v.optional(taskStatusValidator),
    priority: v.optional(taskPriorityValidator),
    area: v.optional(taskAreaValidator),
    scheduled: v.optional(v.number()),
    deadline: v.optional(v.number()),
    timeSpent: v.optional(v.number()),
    done: v.optional(v.boolean()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { id, ...updates } = args;
    const task = await ctx.db.get(id);
    
    if (!task || task.userId !== userId) {
      throw new Error("Task not found or unauthorized");
    }

    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== userId) {
      throw new Error("Task not found or unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});

export const getToday = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    return tasks.filter((task) => {
      if (!task.scheduled) return false;
      const taskDate = new Date(task.scheduled);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === todayTimestamp;
    });
  },
});

export const getOverdue = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    return tasks.filter((task) => {
      if (task.done) return false;
      if (!task.deadline) return false;
      return task.deadline < todayTimestamp;
    });
  },
});

export const getUpcoming = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    return tasks.filter((task) => {
      if (task.done) return false;
      if (!task.scheduled) return false;
      return task.scheduled > todayTimestamp;
    }).slice(0, 10);
  },
});

export const getStats = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    let filteredTasks = tasks;
    if (args.startDate && args.endDate) {
      filteredTasks = tasks.filter((task) => {
        if (!task.scheduled) return false;
        return task.scheduled >= args.startDate! && task.scheduled <= args.endDate!;
      });
    }

    const total = filteredTasks.length;
    const completed = filteredTasks.filter((t) => t.done).length;
    const pending = total - completed;
    
    const byArea: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    
    filteredTasks.forEach((task) => {
      byArea[task.area] = (byArea[task.area] || 0) + 1;
      byPriority[task.priority] = (byPriority[task.priority] || 0) + 1;
    });

    return {
      total,
      completed,
      pending,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      byArea,
      byPriority,
    };
  },
});
