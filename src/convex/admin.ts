import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

// Helper to check if user is admin
async function requireAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  
  const user = await ctx.db.get(userId);
  if (!user || user.role !== "admin") {
    throw new Error("Admin access required");
  }
  
  return { userId, user };
}

// Helper to check if user is admin or support
async function requireAdminOrSupport(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;
  
  const user = await ctx.db.get(userId);
  if (!user || (user.role !== "admin" && user.role !== "support")) {
    return null;
  }
  
  return { userId, user };
}

// Log admin action
export const logAdminAction = internalMutation({
  args: {
    userId: v.id("users"),
    actorId: v.id("users"),
    actionType: v.string(),
    description: v.string(),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("activityLogs", {
      userId: args.userId,
      actorId: args.actorId,
      actionType: args.actionType,
      description: args.description,
      metadata: args.metadata,
      isAdminAction: true,
    });
  },
});

// ===== ANALYTICS =====

export const getAdminStats = query({
  args: {},
  handler: async (ctx) => {
    const auth = await requireAdminOrSupport(ctx);
    if (!auth) return null;

    const users = await ctx.db.query("users").collect();
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    const activeUsers7Days = users.filter(
      (u) => u.lastActiveAt && u.lastActiveAt >= sevenDaysAgo
    ).length;
    const activeUsers30Days = users.filter(
      (u) => u.lastActiveAt && u.lastActiveAt >= thirtyDaysAgo
    ).length;

    const subscriptions = await ctx.db.query("userSubscriptions").collect();
    const activeSubscriptions = subscriptions.filter((s) => s.status === "active");

    const credits = await ctx.db.query("credits").collect();
    const totalCredits = credits.reduce((sum, c) => sum + c.balance, 0);
    const avgCredits = credits.length > 0 ? totalCredits / credits.length : 0;

    return {
      totalUsers: users.length,
      activeUsers7Days,
      activeUsers30Days,
      totalSubscriptions: activeSubscriptions.length,
      totalCredits,
      avgCredits,
    };
  },
});

export const getSignupTrend = query({
  args: { days: v.number() },
  handler: async (ctx, args) => {
    const auth = await requireAdminOrSupport(ctx);
    if (!auth) return null;

    const users = await ctx.db.query("users").collect();
    const now = Date.now();
    const startDate = now - args.days * 24 * 60 * 60 * 1000;

    const signupsByDay: Record<string, number> = {};
    
    users.forEach((user) => {
      if (user._creationTime >= startDate) {
        const date = new Date(user._creationTime).toLocaleDateString();
        signupsByDay[date] = (signupsByDay[date] || 0) + 1;
      }
    });

    return Object.entries(signupsByDay).map(([date, count]) => ({ date, count }));
  },
});

// ===== USER MANAGEMENT =====

export const listUsers = query({
  args: {
    role: v.optional(v.string()),
    plan: v.optional(v.string()),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const auth = await requireAdminOrSupport(ctx);
    if (!auth) return null;

    let users;
    
    if (args.role) {
      users = await ctx.db
        .query("users")
        .withIndex("role", (q) => q.eq("role", args.role as any))
        .collect();
    } else {
      users = await ctx.db.query("users").collect();
    }

    if (args.plan) {
      users = users.filter((u) => u.plan === args.plan);
    }

    if (args.status) {
      users = users.filter((u) => u.status === args.status);
    }

    if (args.limit) {
      users = users.slice(0, args.limit);
    }

    return users;
  },
});

export const getUserDetails = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const auth = await requireAdminOrSupport(ctx);
    if (!auth) return null;

    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const credits = await ctx.db
      .query("credits")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .first();

    const subscription = await ctx.db
      .query("userSubscriptions")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .first();

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .collect();

    const habits = await ctx.db
      .query("habits")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .collect();

    return {
      user,
      credits,
      subscription,
      taskCount: tasks.length,
      habitCount: habits.length,
    };
  },
});

export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("admin"), v.literal("support")),
  },
  handler: async (ctx, args) => {
    const { userId: adminId } = await requireAdmin(ctx);

    await ctx.db.patch(args.userId, { role: args.role });

    await ctx.scheduler.runAfter(0, "admin:logAdminAction" as any, {
      userId: args.userId,
      actorId: adminId,
      actionType: "role_change",
      description: `Role changed to ${args.role}`,
    });

    return { success: true };
  },
});

export const updateUserPlan = mutation({
  args: {
    userId: v.id("users"),
    plan: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId: adminId } = await requireAdmin(ctx);

    await ctx.db.patch(args.userId, { plan: args.plan });

    await ctx.scheduler.runAfter(0, "admin:logAdminAction" as any, {
      userId: args.userId,
      actorId: adminId,
      actionType: "plan_change",
      description: `Plan changed to ${args.plan}`,
    });

    return { success: true };
  },
});

export const suspendUser = mutation({
  args: {
    userId: v.id("users"),
    reason: v.string(),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId: adminId } = await requireAdmin(ctx);

    await ctx.db.patch(args.userId, { status: "suspended" });

    await ctx.db.insert("userSuspensions", {
      userId: args.userId,
      reason: args.reason,
      suspendedBy: adminId,
      suspendedAt: Date.now(),
      expiresAt: args.expiresAt,
      isActive: true,
    });

    await ctx.scheduler.runAfter(0, "admin:logAdminAction" as any, {
      userId: args.userId,
      actorId: adminId,
      actionType: "user_suspended",
      description: `User suspended: ${args.reason}`,
    });

    return { success: true };
  },
});

// ===== CREDITS MANAGEMENT =====

export const getCreditStats = query({
  args: {},
  handler: async (ctx) => {
    const auth = await requireAdminOrSupport(ctx);
    if (!auth) return null;

    const credits = await ctx.db.query("credits").collect();
    const transactions = await ctx.db.query("creditTransactions").collect();

    const totalIssued = credits.reduce((sum, c) => sum + c.totalEarned, 0);
    const totalSpent = credits.reduce((sum, c) => sum + c.totalSpent, 0);
    const outstanding = credits.reduce((sum, c) => sum + c.balance, 0);

    return {
      totalIssued,
      totalSpent,
      outstanding,
      transactionCount: transactions.length,
    };
  },
});

export const getUserCredits = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const auth = await requireAdminOrSupport(ctx);
    if (!auth) return null;

    const credits = await ctx.db
      .query("credits")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .first();

    const transactions = await ctx.db
      .query("creditTransactions")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .collect();

    return { credits, transactions };
  },
});

export const adjustUserCredits = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    reason: v.string(),
    adminNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId: adminId } = await requireAdmin(ctx);

    let credits = await ctx.db
      .query("credits")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!credits) {
      credits = {
        _id: await ctx.db.insert("credits", {
          userId: args.userId,
          balance: 0,
          totalEarned: 0,
          totalSpent: 0,
        }) as Id<"credits">,
        userId: args.userId,
        balance: 0,
        totalEarned: 0,
        totalSpent: 0,
        _creationTime: Date.now(),
      };
    }

    const newBalance = credits.balance + args.amount;
    const newTotalEarned = args.amount > 0 ? credits.totalEarned + args.amount : credits.totalEarned;
    const newTotalSpent = args.amount < 0 ? credits.totalSpent + Math.abs(args.amount) : credits.totalSpent;

    await ctx.db.patch(credits._id, {
      balance: newBalance,
      totalEarned: newTotalEarned,
      totalSpent: newTotalSpent,
    });

    await ctx.db.insert("creditTransactions", {
      userId: args.userId,
      amount: args.amount,
      type: "adjustment",
      reason: args.reason,
      adminId,
      adminNote: args.adminNote,
    });

    await ctx.scheduler.runAfter(0, "admin:logAdminAction" as any, {
      userId: args.userId,
      actorId: adminId,
      actionType: "credit_adjustment",
      description: `Credits adjusted by ${args.amount}: ${args.reason}`,
    });

    return { success: true, newBalance };
  },
});

// ===== ACTIVITY LOGS =====

export const getActivityLogs = query({
  args: {
    userId: v.optional(v.id("users")),
    actionType: v.optional(v.string()),
    isAdminAction: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const auth = await requireAdminOrSupport(ctx);
    if (!auth) return null;

    let logs;

    if (args.userId) {
      logs = await ctx.db
        .query("activityLogs")
        .withIndex("userId", (q) => q.eq("userId", args.userId as Id<"users">))
        .collect();
    } else if (args.isAdminAction !== undefined) {
      logs = await ctx.db
        .query("activityLogs")
        .withIndex("isAdminAction", (q) => q.eq("isAdminAction", args.isAdminAction as boolean))
        .collect();
    } else {
      logs = await ctx.db.query("activityLogs").collect();
    }

    if (args.actionType) {
      logs = logs.filter((log) => log.actionType === args.actionType);
    }

    logs.sort((a, b) => b._creationTime - a._creationTime);

    if (args.limit) {
      logs = logs.slice(0, args.limit);
    }

    return logs;
  },
});