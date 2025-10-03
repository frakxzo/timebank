import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get user transactions
export const getByUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return transactions;
  },
});

// Purchase points (company only)
export const purchasePoints = mutation({
  args: {
    packageId: v.id("pointPackages"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "company") {
      throw new Error("Only companies can purchase points");
    }

    const pkg = await ctx.db.get(args.packageId);
    if (!pkg || !pkg.isActive) {
      throw new Error("Package not available");
    }

    // Add points to user balance
    const currentBalance = user.pointsBalance || 0;
    await ctx.db.patch(user._id, {
      pointsBalance: currentBalance + pkg.points,
    });

    // Record transaction
    await ctx.db.insert("transactions", {
      userId: user._id,
      type: "purchase",
      amount: pkg.points,
      description: `Purchased ${pkg.name}`,
      packageId: args.packageId,
    });
  },
});

// Complete project and transfer points
export const completeProject = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    if (project.companyId !== user._id && user.role !== "admin") {
      throw new Error("Not authorized");
    }

    if (!project.assignedInternId) {
      throw new Error("No intern assigned to this project");
    }

    // Deduct points from company
    const companyBalance = user.pointsBalance || 0;
    if (companyBalance < project.pointsReward) {
      throw new Error("Insufficient points");
    }

    await ctx.db.patch(user._id, {
      pointsBalance: companyBalance - project.pointsReward,
      totalPointsSpent: (user.totalPointsSpent || 0) + project.pointsReward,
    });

    // Add points to intern
    const intern = await ctx.db.get(project.assignedInternId);
    if (intern) {
      await ctx.db.patch(intern._id, {
        pointsBalance: (intern.pointsBalance || 0) + project.pointsReward,
        totalPointsEarned: (intern.totalPointsEarned || 0) + project.pointsReward,
      });

      // Record intern transaction
      await ctx.db.insert("transactions", {
        userId: intern._id,
        type: "earn",
        amount: project.pointsReward,
        description: `Earned from project: ${project.title}`,
        projectId: args.projectId,
      });
    }

    // Record company transaction
    await ctx.db.insert("transactions", {
      userId: user._id,
      type: "spend",
      amount: project.pointsReward,
      description: `Paid for project: ${project.title}`,
      projectId: args.projectId,
    });

    // Update project status
    await ctx.db.patch(args.projectId, {
      status: "completed",
      completedAt: Date.now(),
    });
  },
});
