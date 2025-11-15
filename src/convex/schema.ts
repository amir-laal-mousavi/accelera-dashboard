import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// Validators for enums
export const moodValidator = v.union(
  v.literal("Great"),
  v.literal("Good"),
  v.literal("Okay"),
  v.literal("Bad"),
  v.literal("Terrible")
);

export const taskStatusValidator = v.union(
  v.literal("Not Started"),
  v.literal("In Progress"),
  v.literal("Done"),
  v.literal("Blocked")
);

export const taskPriorityValidator = v.union(
  v.literal("Critical"),
  v.literal("High"),
  v.literal("Medium"),
  v.literal("Low")
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
  v.literal("Other")
);

const schema = defineSchema(
  {
    ...authTables,

    // Users
    users: defineTable({
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      phone: v.optional(v.string()),
      phoneVerificationTime: v.optional(v.number()),
      image: v.optional(v.string()),
      isAnonymous: v.optional(v.boolean()),
    }).index("email", ["email"]),

    // Tasks
    tasks: defineTable({
      userId: v.id("users"),
      task: v.string(),
      status: taskStatusValidator,
      priority: taskPriorityValidator,
      area: taskAreaValidator,
      scheduled: v.optional(v.number()),
      deadline: v.optional(v.number()),
      timeSpent: v.optional(v.number()),
      done: v.boolean(),
      notes: v.optional(v.string()),
    }).index("userId", ["userId"]),

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

    // Water logs
    waterLogs: defineTable({
      userId: v.id("users"),
      dateTime: v.number(),
      amount: v.number(),
      goal: v.optional(v.number()),
    }).index("userId", ["userId"]),

    // Caffeine logs
    caffeineLogs: defineTable({
      userId: v.id("users"),
      dateTime: v.number(),
      drink: v.string(),
      type: v.string(),
      volume: v.number(),
      caffeine: v.number(),
    }).index("userId", ["userId"]),

    // Workout logs
    workoutLogs: defineTable({
      userId: v.id("users"),
      date: v.number(),
      session: v.string(),
      exercise: v.string(),
      sets: v.optional(v.number()),
      repsPerSet: v.optional(v.number()),
      weight: v.optional(v.number()),
      duration: v.optional(v.number()),
      calories: v.optional(v.number()),
      intensity: v.optional(v.string()),
    }).index("userId", ["userId"]),

    // Sleep logs
    sleepLogs: defineTable({
      userId: v.id("users"),
      date: v.number(),
      duration: v.number(),
      notes: v.optional(v.string()),
    }).index("userId", ["userId"]),

    // Weight logs
    weightLogs: defineTable({
      userId: v.id("users"),
      date: v.number(),
      weight: v.number(),
    }).index("userId", ["userId"]),

    // Expenses
    expenses: defineTable({
      userId: v.id("users"),
      expense: v.string(),
      amount: v.number(),
      category: v.string(),
      date: v.number(),
      payment: v.optional(v.string()),
      notes: v.optional(v.string()),
    }).index("userId", ["userId"]),

    // Incomes
    incomes: defineTable({
      userId: v.id("users"),
      income: v.string(),
      amount: v.number(),
      category: v.string(),
      date: v.number(),
      notes: v.optional(v.string()),
    }).index("userId", ["userId"]),

    // Budgets
    budgets: defineTable({
      userId: v.id("users"),
      budgetItem: v.string(),
      monthlyBudget: v.number(),
      category: v.string(),
      notes: v.optional(v.string()),
    }).index("userId", ["userId"]),

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
      rating: v.optional(v.number()),
      cover: v.optional(v.string()),
      notes: v.optional(v.string()),
    }).index("userId", ["userId"]),

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
      .index("bookId", ["bookId"]),

    // Habits
    habits: defineTable({
      userId: v.id("users"),
      name: v.string(),
      description: v.optional(v.string()),
      category: v.optional(v.string()),
      frequency: v.string(),
      targetDays: v.optional(v.number()),
      challengeLength: v.optional(v.number()),
      startDate: v.optional(v.number()),
      color: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
    }).index("userId", ["userId"]),

    // Habit cycles
    habitCycles: defineTable({
      userId: v.id("users"),
      habitId: v.id("habits"),
      startDate: v.number(),
      endDate: v.number(),
      targetDays: v.number(),
      completedDays: v.number(),
      longestStreak: v.number(),
      completionRate: v.number(),
      isCompleted: v.boolean(),
    })
      .index("userId", ["userId"])
      .index("habitId", ["habitId"]),

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