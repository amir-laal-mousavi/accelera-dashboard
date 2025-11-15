import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const books = await ctx.db
      .query("books")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    // Get reading sessions for each book
    const booksWithProgress = await Promise.all(
      books.map(async (book) => {
        const sessions = await ctx.db
          .query("readingSessions")
          .withIndex("bookId", (q) => q.eq("bookId", book._id))
          .collect();

        const pagesRead = sessions.reduce((sum, s) => sum + (s.endPage - s.startPage), 0);
        const minutesRead = sessions.reduce((sum, s) => sum + s.minutes, 0);
        const progress = book.totalPages ? (pagesRead / book.totalPages) * 100 : 0;

        return {
          ...book,
          pagesRead,
          minutesRead,
          progress,
          sessionsCount: sessions.length,
        };
      })
    );

    return booksWithProgress;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    author: v.optional(v.string()),
    genre: v.optional(v.string()),
    totalPages: v.optional(v.number()),
    startDate: v.optional(v.number()),
    cover: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("books", {
      userId,
      status: "Reading",
      ...args,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("books"),
    name: v.optional(v.string()),
    author: v.optional(v.string()),
    genre: v.optional(v.string()),
    totalPages: v.optional(v.number()),
    finishDate: v.optional(v.number()),
    status: v.optional(v.string()),
    rating: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { id, ...updates } = args;
    const book = await ctx.db.get(id);
    
    if (!book || book.userId !== userId) {
      throw new Error("Book not found or unauthorized");
    }

    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("books") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const book = await ctx.db.get(args.id);
    if (!book || book.userId !== userId) {
      throw new Error("Book not found or unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});

// Reading sessions
export const listSessions = query({
  args: {
    bookId: v.optional(v.id("books")),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let sessions = await ctx.db
      .query("readingSessions")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    if (args.bookId) {
      sessions = sessions.filter((s) => s.bookId === args.bookId);
    }

    if (args.startDate && args.endDate) {
      sessions = sessions.filter((s) => s.date >= args.startDate! && s.date <= args.endDate!);
    }

    return sessions;
  },
});

export const addSession = mutation({
  args: {
    bookId: v.id("books"),
    date: v.number(),
    startPage: v.number(),
    endPage: v.number(),
    minutes: v.number(),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("readingSessions", {
      userId,
      ...args,
    });
  },
});

export const getReadingStats = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const sessions = await ctx.db
      .query("readingSessions")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    const filtered = sessions.filter((s) => s.date >= args.startDate && s.date <= args.endDate);

    const totalPages = filtered.reduce((sum, s) => sum + (s.endPage - s.startPage), 0);
    const totalMinutes = filtered.reduce((sum, s) => sum + s.minutes, 0);

    return {
      totalPages,
      totalMinutes,
      totalSessions: filtered.length,
      sessions: filtered,
    };
  },
});
