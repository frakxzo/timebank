import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getCurrentUser } from "./users";

// Update user profile
export const update = mutation({
  args: {
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    company: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    location: v.optional(v.string()),
    website: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    await ctx.db.patch(user._id, args);
  },
});

// Set user role (for onboarding)
export const setRole = mutation({
  args: {
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    await ctx.db.patch(user._id, {
      role: args.role as any,
      pointsBalance: 0,
      totalPointsEarned: 0,
      totalPointsSpent: 0,
    });
  },
});