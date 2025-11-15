import { defineTable } from "convex/server";
import { v } from "convex/values";

// Admin-specific schema extensions
export const adminTables = {
  // Credits system
  credits: defineTable({
    userId: v.id("users"),
    balance: v.number(),
    totalEarned: v.number(),
    totalSpent: v.number(),
  }).index("userId", ["userId"]),

  creditTransactions: defineTable({
    userId: v.id("users"),
    amount: v.number(),
    type: v.union(v.literal("earn"), v.literal("spend"), v.literal("adjustment")),
    reason: v.string(),
    relatedFeature: v.optional(v.string()),
    adminId: v.optional(v.id("users")),
    adminNote: v.optional(v.string()),
  }).index("userId", ["userId"]),

  // Activity logs for audit trail
  activityLogs: defineTable({
    userId: v.id("users"),
    actorId: v.optional(v.id("users")),
    actionType: v.string(),
    description: v.string(),
    metadata: v.optional(v.string()),
    isAdminAction: v.boolean(),
  })
    .index("userId", ["userId"])
    .index("actorId", ["actorId"])
    .index("isAdminAction", ["isAdminAction"]),

  // Subscription plans
  subscriptionPlans: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    billingPeriod: v.union(v.literal("monthly"), v.literal("yearly")),
    features: v.array(v.string()),
    creditAllowance: v.number(),
    isActive: v.boolean(),
  }),

  // User subscriptions
  userSubscriptions: defineTable({
    userId: v.id("users"),
    planId: v.id("subscriptionPlans"),
    status: v.union(
      v.literal("active"),
      v.literal("cancelled"),
      v.literal("expired"),
      v.literal("trial")
    ),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    autoRenew: v.boolean(),
  })
    .index("userId", ["userId"])
    .index("planId", ["planId"]),

  // Feature flags
  featureFlags: defineTable({
    featureName: v.string(),
    isEnabled: v.boolean(),
    requiredPlan: v.optional(v.string()),
    description: v.optional(v.string()),
  }),

  // User bans/suspensions
  userSuspensions: defineTable({
    userId: v.id("users"),
    reason: v.string(),
    suspendedBy: v.id("users"),
    suspendedAt: v.number(),
    expiresAt: v.optional(v.number()),
    isActive: v.boolean(),
  }).index("userId", ["userId"]),
};
