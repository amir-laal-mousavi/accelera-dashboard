import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Start a 7-day free trial for the current user
export const startTrial = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    // Check if user has already used their trial
    if (user.hasUsedTrial) {
      throw new Error("You have already used your free trial");
    }

    // Check if user is already on a paid plan
    if (user.plan === "pro" && !user.isOnTrial) {
      throw new Error("You are already on a Pro plan");
    }

    const now = Date.now();
    const trialEndAt = now + 7 * 24 * 60 * 60 * 1000; // 7 days from now

    await ctx.db.patch(userId, {
      isOnTrial: true,
      trialStartAt: now,
      trialEndAt,
      hasUsedTrial: true,
      plan: "pro",
    });

    return { success: true, trialEndAt };
  },
});

// Get trial status for the current user
export const getTrialStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    const now = Date.now();
    const isTrialActive =
      user.isOnTrial &&
      user.trialStartAt &&
      user.trialEndAt &&
      now >= user.trialStartAt &&
      now <= user.trialEndAt;

    let daysLeft = 0;
    if (isTrialActive && user.trialEndAt) {
      daysLeft = Math.ceil((user.trialEndAt - now) / (24 * 60 * 60 * 1000));
    }

    return {
      isOnTrial: isTrialActive,
      hasUsedTrial: user.hasUsedTrial || false,
      trialStartAt: user.trialStartAt,
      trialEndAt: user.trialEndAt,
      daysLeft,
      plan: user.plan || "free",
    };
  },
});

// Check if user has Pro access (either paid or trial)
export const hasProAccess = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    const user = await ctx.db.get(userId);
    if (!user) return false;

    // Admin always has access
    if (user.role === "admin") return true;

    const now = Date.now();
    const isTrialActive =
      user.isOnTrial &&
      user.trialStartAt &&
      user.trialEndAt &&
      now >= user.trialStartAt &&
      now <= user.trialEndAt;

    // Has Pro access if on paid Pro plan or active trial
    return user.plan === "pro" && (isTrialActive || !user.isOnTrial);
  },
});

// Expire trials (should be called by a cron job)
export const expireTrials = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const users = await ctx.db.query("users").collect();

    let expiredCount = 0;

    for (const user of users) {
      if (
        user.isOnTrial &&
        user.trialEndAt &&
        now > user.trialEndAt &&
        user.plan === "pro"
      ) {
        // Downgrade to free plan
        await ctx.db.patch(user._id, {
          isOnTrial: false,
          plan: "free",
        });
        expiredCount++;
      }
    }

    return { expiredCount };
  },
});
