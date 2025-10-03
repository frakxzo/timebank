import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get all active packages
export const list = query({
  args: {},
  handler: async (ctx) => {
    const packages = await ctx.db
      .query("pointPackages")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return packages;
  },
});

// Create package (admin only)
export const create = mutation({
  args: {
    name: v.string(),
    points: v.number(),
    price: v.number(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Only admins can create packages");
    }

    const packageId = await ctx.db.insert("pointPackages", {
      ...args,
      isActive: true,
    });

    return packageId;
  },
});
