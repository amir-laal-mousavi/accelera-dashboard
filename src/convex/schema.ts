import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// User roles
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

// Task status and priority
export const taskStatusValidator = v.union(
  v.literal("Not Started"),
  v.literal("In Progress"),
  v.literal("Done"),
  v.literal("Blocked"),
);

export const taskPriorityValidator = v.union(
  v.literal("Critical"),
  v.literal("High"),
  v.literal("Medium"),
  v.literal("Low"),
);

export const taskAreaValidator = v.union(
  v.literal("Work"),
  v.literal("Study"),
  v.literal("Programming"),
  v.literal("Fitness"),
  v.literal("Finance"),
  v.literal("Book"),
  v.literal("Studying"),
  v.literal("Self"),
  v.literal("Research"),
  v.literal("Startup"),
  v.literal("Other"),
);

// Mood types
export const moodValidator = v.union(
  v.literal("Great"),
  v.literal("Good"),
  v.literal("Okay"),
  v.literal("Bad"),
  v.literal("Terrible"),
);

// Subscription tiers
export const subscriptionTierValidator = v.union(
  v.literal("free"),
  v.literal("pro"),
);

const schema = defineSchema(
  {
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
      subscriptionTier: v.optional(subscriptionTierValidator),
      stripeCustomerId: v.optional(v.string()),
      stripeSubscriptionId: v.optional(v.string()),
    })
      .index("email", ["email"])
      .index("stripeCustomerId", ["stripeCustomerId"]),

    // Tasks table
    tasks: defineTable({
      userId: v.id("users"),
      task: v.string(),
      status: taskStatusValidator,
      priority: taskPriorityValidator,
      area: taskAreaValidator,
      scheduled: v.optional(v.number()),
      deadline: v.optional(v.number()),
      timeSpent: v.optional(v.number()), // in minutes
      done: v.boolean(),
      dailyLogId: v.optional(v.id("dailyLogs")),
      notes: v.optional(v.string()),
    })
      .index("userId", ["userId"])
      .index("userId_scheduled", ["userId", "scheduled"])
      .index("userId_done", ["userId", "done"])
      .index("userId_area", ["userId", "area"]),

    // Daily logs
    dailyLogs: defineTable({
      userId: v.id("users"),
      date: v.number(),
      mood: v.optional(moodValidator),
      caloriesBurned: v.optional(v.number()),
      notes: v.optional(v.string()),
      productivityScore: v.optional(v.number()),
      healthScore: v.optional(v.number()),
    })
      .index("userId", ["userId"])
      .index("userId_date", ["userId", "date"]),

    // Water log
    waterLogs: defineTable({
      userId: v.id("users"),
      dailyLogId: v.optional(v.id("dailyLogs")),
      dateTime: v.number(),
      amount: v.number(), // ml
      goal: v.optional(v.number()), // ml
    })
      .index("userId", ["userId"])
      .index("userId_dateTime", ["userId", "dateTime"])
      .index("dailyLogId", ["dailyLogId"]),

    // Caffeine log
    caffeineLogs: defineTable({
      userId: v.id("users"),
      dailyLogId: v.optional(v.id("dailyLogs")),
      dateTime: v.number(),
      drink: v.string(),
      type: v.string(),
      volume: v.number(), // ml
      caffeine: v.number(), // mg
    })
      .index("userId", ["userId"])
      .index("userId_dateTime", ["userId", "dateTime"])
      .index("dailyLogId", ["dailyLogId"]),

    // Workout log
    workoutLogs: defineTable({
      userId: v.id("users"),
      dailyLogId: v.optional(v.id("dailyLogs")),
      date: v.number(),
      session: v.string(),
      exercise: v.string(),
      sets: v.optional(v.number()),
      repsPerSet: v.optional(v.number()),
      weight: v.optional(v.number()), // kg
      duration: v.optional(v.number()), // minutes
      calories: v.optional(v.number()),
      intensity: v.optional(v.string()),
    })
      .index("userId", ["userId"])
      .index("userId_date", ["userId", "date"])
      .index("dailyLogId", ["dailyLogId"]),

    // Sleep log
    sleepLogs: defineTable({
      userId: v.id("users"),
      dailyLogId: v.optional(v.id("dailyLogs")),
      date: v.number(),
      duration: v.number(), // hours
      notes: v.optional(v.string()),
    })
      .index("userId", ["userId"])
      .index("userId_date", ["userId", "date"])
      .index("dailyLogId", ["dailyLogId"]),

    // Weight log
    weightLogs: defineTable({
      userId: v.id("users"),
      date: v.number(),
      weight: v.number(), // kg
    })
      .index("userId", ["userId"])
      .index("userId_date", ["userId", "date"]),

    // Expenses
    expenses: defineTable({
      userId: v.id("users"),
      expense: v.string(),
      amount: v.number(),
      category: v.string(),
      date: v.number(),
      payment: v.optional(v.string()),
      notes: v.optional(v.string()),
      budgetId: v.optional(v.id("budgets")),
    })
      .index("userId", ["userId"])
      .index("userId_date", ["userId", "date"])
      .index("userId_category", ["userId", "category"])
      .index("budgetId", ["budgetId"]),

    // Budget
    budgets: defineTable({
      userId: v.id("users"),
      budgetItem: v.string(),
      monthlyBudget: v.number(),
      category: v.string(),
      notes: v.optional(v.string()),
    })
      .index("userId", ["userId"])
      .index("userId_category", ["userId", "category"]),

    // Incomes
    incomes: defineTable({
      userId: v.id("users"),
      income: v.string(),
      amount: v.number(),
      category: v.string(),
      date: v.number(),
      notes: v.optional(v.string()),
    })
      .index("userId", ["userId"])
      .index("userId_date", ["userId", "date"])
      .index("userId_category", ["userId", "category"]),

    // Books
    books: defineTable({
      userId: v.id("users"),
      name: v.string(),
      author: v.optional(v.string()),
      genre: v.optional(v.string()),
      totalPages: v.optional(v.number()),
      startDate: v.optional(v.number()),
      finishDate: v.optional(v.number()),
      status: v.optional(v.string()),
      cover: v.optional(v.string()),
      notes: v.optional(v.string()),
      rating: v.optional(v.number()),
    })
      .index("userId", ["userId"])
      .index("userId_status", ["userId", "status"]),

    // Reading sessions
    readingSessions: defineTable({
      userId: v.id("users"),
      bookId: v.id("books"),
      date: v.number(),
      startPage: v.number(),
      endPage: v.number(),
      minutes: v.number(),
      location: v.optional(v.string()),
      notes: v.optional(v.string()),
    })
      .index("userId", ["userId"])
      .index("bookId", ["bookId"])
      .index("userId_date", ["userId", "date"]),

    // Monthly logs
    monthlyLogs: defineTable({
      userId: v.id("users"),
      month: v.string(),
      start: v.number(),
      end: v.number(),
      notes: v.optional(v.string()),
      goals: v.optional(v.string()),
    })
      .index("userId", ["userId"])
      .index("userId_start", ["userId", "start"]),

    // Habits
    habits: defineTable({
      userId: v.id("users"),
      name: v.string(),
      description: v.optional(v.string()),
      frequency: v.string(), // daily, weekly, etc
      targetDays: v.optional(v.number()),
      color: v.optional(v.string()),
    }).index("userId", ["userId"]),

    // Habit completions
    habitCompletions: defineTable({
      userId: v.id("users"),
      habitId: v.id("habits"),
      date: v.number(),
      completed: v.boolean(),
      notes: v.optional(v.string()),
    })
      .index("userId", ["userId"])
      .index("habitId", ["habitId"])
      .index("userId_date", ["userId", "date"])
      .index("habitId_date", ["habitId", "date"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;