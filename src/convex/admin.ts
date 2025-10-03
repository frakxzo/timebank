import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get all users (admin only)
export const getAllUsers = query({
  args: {
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Admin access required");
    }

    let users = await ctx.db.query("users").collect();

    if (args.role && args.role !== "all") {
      users = users.filter((u) => u.role === args.role);
    }

    return users;
  },
});

// Update user role (admin only)
export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Admin access required");
    }

    await ctx.db.patch(args.userId, {
      role: args.role as any,
    });
  },
});

// Get dashboard stats (admin only)
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Admin access required");
    }

    const users = await ctx.db.query("users").collect();
    const projects = await ctx.db.query("projects").collect();
    const transactions = await ctx.db.query("transactions").collect();
    const courses = await ctx.db.query("courses").collect();

    return {
      totalUsers: users.length,
      totalCompanies: users.filter((u) => u.role === "company").length,
      totalInterns: users.filter((u) => u.role === "intern").length,
      totalProjects: projects.length,
      activeProjects: projects.filter((p) => p.status === "open" || p.status === "in_progress").length,
      completedProjects: projects.filter((p) => p.status === "completed").length,
      totalTransactions: transactions.length,
      totalCourses: courses.length,
    };
  },
});
