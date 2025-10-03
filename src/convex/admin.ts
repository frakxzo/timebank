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

export const promoteUserToAdminByEmail = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const actor = await getCurrentUser(ctx);
    if (!actor || actor.role !== "admin") {
      throw new Error("Admin access required");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .unique();
    if (!user) {
      throw new Error(`User with email ${args.email} not found. Ask them to sign in once first.`);
    }
    await ctx.db.patch(user._id, { role: "admin" as any, isBanned: false });
  },
});

export const adjustUserPoints = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(), // positive to add, negative to subtract
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await getCurrentUser(ctx);
    if (!actor || actor.role !== "admin") {
      throw new Error("Admin access required");
    }

    const target = await ctx.db.get(args.userId);
    if (!target) throw new Error("User not found");

    const current = target.pointsBalance || 0;
    const newBalance = current + args.amount;
    if (newBalance < 0) {
      throw new Error("Insufficient balance after adjustment");
    }

    await ctx.db.patch(args.userId, {
      pointsBalance: newBalance,
      totalPointsEarned: (target.totalPointsEarned || 0) + Math.max(0, args.amount),
      totalPointsSpent: (target.totalPointsSpent || 0) + Math.max(0, -args.amount),
    });

    await ctx.db.insert("transactions", {
      userId: args.userId,
      type: args.amount >= 0 ? "earn" : "spend",
      amount: Math.abs(args.amount),
      description: args.reason || "Admin adjustment",
    });
  },
});

export const setUserBan = mutation({
  args: {
    userId: v.id("users"),
    isBanned: v.boolean(),
  },
  handler: async (ctx, args) => {
    const actor = await getCurrentUser(ctx);
    if (!actor || actor.role !== "admin") {
      throw new Error("Admin access required");
    }
    await ctx.db.patch(args.userId, { isBanned: args.isBanned });
  },
});

export const deleteUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const actor = await getCurrentUser(ctx);
    if (!actor || actor.role !== "admin") {
      throw new Error("Admin access required");
    }

    // Delete projects owned by user (companies), along with applications for each project
    for await (const project of ctx.db
      .query("projects")
      .withIndex("by_company", (q) => q.eq("companyId", args.userId))) {
      for await (const app of ctx.db
        .query("applications")
        .withIndex("by_project", (q) => q.eq("projectId", project._id))) {
        await ctx.db.delete(app._id);
      }
      await ctx.db.delete(project._id);
    }

    // Delete applications made by user (interns)
    for await (const app of ctx.db
      .query("applications")
      .withIndex("by_intern", (q) => q.eq("internId", args.userId))) {
      await ctx.db.delete(app._id);
    }

    // Delete transactions for user
    for await (const txn of ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))) {
      await ctx.db.delete(txn._id);
    }

    // Delete courses uploaded by user and their courseProgress
    for await (const course of ctx.db
      .query("courses")
      .withIndex("by_uploader", (q) => q.eq("uploadedBy", args.userId))) {
      for await (const prog of ctx.db
        .query("courseProgress")
        .withIndex("by_course", (q) => q.eq("courseId", course._id))) {
        await ctx.db.delete(prog._id);
      }
      await ctx.db.delete(course._id);
    }

    // Delete course progress entries by user (if any)
    for await (const prog of ctx.db
      .query("courseProgress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))) {
      await ctx.db.delete(prog._id);
    }

    // Finally delete user doc
    await ctx.db.delete(args.userId);
  },
});