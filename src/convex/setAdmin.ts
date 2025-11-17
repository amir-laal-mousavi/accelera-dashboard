import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const makeCurrentUserAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    await ctx.db.patch(userId, { role: "admin" });
    
    return { success: true, message: "User is now an admin" };
  },
});
