import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Expenses
export const listExpenses = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const expenses = await ctx.db
      .query("expenses")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    let filtered = expenses;
    if (args.startDate && args.endDate) {
      filtered = filtered.filter((e) => e.date >= args.startDate! && e.date <= args.endDate!);
    }
    if (args.category) {
      filtered = filtered.filter((e) => e.category === args.category);
    }

    return filtered;
  },
});

export const addExpense = mutation({
  args: {
    expense: v.string(),
    amount: v.number(),
    category: v.string(),
    date: v.number(),
    payment: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("expenses", {
      userId,
      ...args,
    });
  },
});

export const removeExpense = mutation({
  args: { id: v.id("expenses") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const expense = await ctx.db.get(args.id);
    if (!expense || expense.userId !== userId) {
      throw new Error("Expense not found or unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});

// Incomes
export const listIncomes = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const incomes = await ctx.db
      .query("incomes")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    if (args.startDate && args.endDate) {
      return incomes.filter((i) => i.date >= args.startDate! && i.date <= args.endDate!);
    }

    return incomes;
  },
});

export const addIncome = mutation({
  args: {
    income: v.string(),
    amount: v.number(),
    category: v.string(),
    date: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("incomes", {
      userId,
      ...args,
    });
  },
});

export const getFinanceStats = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const expenses = await ctx.db
      .query("expenses")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    const incomes = await ctx.db
      .query("incomes")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    const filteredExpenses = expenses.filter((e) => e.date >= args.startDate && e.date <= args.endDate);
    const filteredIncomes = incomes.filter((i) => i.date >= args.startDate && i.date <= args.endDate);

    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = filteredIncomes.reduce((sum, i) => sum + i.amount, 0);

    const expensesByCategory: Record<string, number> = {};
    filteredExpenses.forEach((e) => {
      expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amount;
    });

    return {
      totalExpenses,
      totalIncome,
      netBalance: totalIncome - totalExpenses,
      expensesByCategory,
      expenses: filteredExpenses,
      incomes: filteredIncomes,
    };
  },
});

// Budgets
export const listBudgets = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("budgets")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const addBudget = mutation({
  args: {
    budgetItem: v.string(),
    monthlyBudget: v.number(),
    category: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("budgets", {
      userId,
      ...args,
    });
  },
});
