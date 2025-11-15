import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const seedData = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const { userId } = args;

    // Seed tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tasks = [
      {
        task: "Complete project proposal",
        status: "Done" as const,
        priority: "High" as const,
        area: "Work" as const,
        scheduled: today.getTime(),
        done: true,
        timeSpent: 120,
      },
      {
        task: "Review code changes",
        status: "In Progress" as const,
        priority: "Medium" as const,
        area: "Programming" as const,
        scheduled: today.getTime(),
        done: false,
        timeSpent: 45,
      },
      {
        task: "Gym workout",
        status: "Done" as const,
        priority: "Medium" as const,
        area: "Fitness" as const,
        scheduled: today.getTime(),
        done: true,
        timeSpent: 60,
      },
      {
        task: "Read research paper",
        status: "Not Started" as const,
        priority: "Low" as const,
        area: "Study" as const,
        scheduled: today.getTime() + 86400000,
        done: false,
        timeSpent: 0,
      },
    ];

    for (const task of tasks) {
      await ctx.db.insert("tasks", { userId, ...task });
    }

    // Seed daily logs for the past 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      await ctx.db.insert("dailyLogs", {
        userId,
        date: date.getTime(),
        mood: ["Great", "Good", "Okay"][Math.floor(Math.random() * 3)] as any,
        productivityScore: 60 + Math.random() * 40,
        healthScore: 70 + Math.random() * 30,
        caloriesBurned: 200 + Math.random() * 300,
      });
    }

    // Seed water logs
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      for (let j = 0; j < 8; j++) {
        await ctx.db.insert("waterLogs", {
          userId,
          dateTime: date.getTime() + j * 3600000,
          amount: 250,
          goal: 2000,
        });
      }
    }

    // Seed caffeine logs
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      await ctx.db.insert("caffeineLogs", {
        userId,
        dateTime: date.getTime() + 28800000,
        drink: "Coffee",
        type: "Coffee",
        volume: 200,
        caffeine: 95,
      });
    }

    // Seed workout logs
    for (let i = 0; i < 10; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i * 2);
      
      await ctx.db.insert("workoutLogs", {
        userId,
        date: date.getTime(),
        session: `Workout ${i + 1}`,
        exercise: ["Cardio", "Strength", "Yoga"][i % 3],
        duration: 30 + Math.random() * 60,
        calories: 200 + Math.random() * 300,
        intensity: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
      });
    }

    // Seed sleep logs
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      await ctx.db.insert("sleepLogs", {
        userId,
        date: date.getTime(),
        duration: 6 + Math.random() * 3,
      });
    }

    // Seed expenses
    const expenseCategories = ["Food", "Transport", "Health", "Entertainment", "Shopping"];
    for (let i = 0; i < 20; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      
      await ctx.db.insert("expenses", {
        userId,
        expense: `Expense ${i + 1}`,
        amount: 10 + Math.random() * 100,
        category: expenseCategories[Math.floor(Math.random() * expenseCategories.length)],
        date: date.getTime(),
        payment: "Card",
      });
    }

    // Seed incomes
    for (let i = 0; i < 3; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i * 10);
      
      await ctx.db.insert("incomes", {
        userId,
        income: `Salary ${i + 1}`,
        amount: 3000 + Math.random() * 2000,
        category: "Salary",
        date: date.getTime(),
      });
    }

    // Seed books
    const bookId = await ctx.db.insert("books", {
      userId,
      name: "Atomic Habits",
      author: "James Clear",
      genre: "Self-Help",
      totalPages: 320,
      startDate: today.getTime() - 2592000000,
      status: "Reading",
    });

    // Seed reading sessions
    for (let i = 0; i < 15; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      await ctx.db.insert("readingSessions", {
        userId,
        bookId,
        date: date.getTime(),
        startPage: i * 20,
        endPage: (i + 1) * 20,
        minutes: 20 + Math.random() * 20,
      });
    }

    // Seed habits
    const habitId = await ctx.db.insert("habits", {
      userId,
      name: "Morning Exercise",
      description: "30 minutes of exercise every morning",
      frequency: "daily",
      targetDays: 7,
      color: "#10b981",
    });

    // Seed habit completions
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      await ctx.db.insert("habitCompletions", {
        userId,
        habitId,
        date: date.getTime(),
        completed: Math.random() > 0.3,
      });
    }

    return { success: true };
  },
});
