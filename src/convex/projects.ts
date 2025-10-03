import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get all projects with filters
export const list = query({
  args: {
    status: v.optional(v.string()),
    category: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let projects = await ctx.db.query("projects").collect();

    if (args.status && args.status !== "all") {
      projects = projects.filter((p) => p.status === args.status);
    }

    if (args.category && args.category !== "all") {
      projects = projects.filter((p) => p.category === args.category);
    }

    if (args.search) {
      const searchLower = args.search.toLowerCase();
      projects = projects.filter(
        (p) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
      );
    }

    // Get company info for each project
    const projectsWithCompany = await Promise.all(
      projects.map(async (project) => {
        const company = await ctx.db.get(project.companyId);
        return {
          ...project,
          companyName: company?.name || company?.email || "Unknown",
          companyImage: company?.image,
        };
      })
    );

    return projectsWithCompany;
  },
});

// Get project by ID
export const getById = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.id);
    if (!project) return null;

    const company = await ctx.db.get(project.companyId);
    return {
      ...project,
      companyName: company?.name || company?.email || "Unknown",
      companyImage: company?.image,
    };
  },
});

// Create a new project (company only)
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    pointsReward: v.number(),
    category: v.string(),
    difficulty: v.string(),
    duration: v.string(),
    requirements: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "company") {
      throw new Error("Only companies can create projects");
    }

    const projectId = await ctx.db.insert("projects", {
      ...args,
      companyId: user._id,
      status: "open",
    });

    return projectId;
  },
});

// Update project
export const update = mutation({
  args: {
    id: v.id("projects"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    pointsReward: v.optional(v.number()),
    category: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    duration: v.optional(v.string()),
    requirements: v.optional(v.array(v.string())),
    status: v.optional(v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    )),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const project = await ctx.db.get(args.id);
    if (!project) throw new Error("Project not found");

    if (project.companyId !== user._id && user.role !== "admin") {
      throw new Error("Not authorized");
    }

    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

// Delete project
export const remove = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const project = await ctx.db.get(args.id);
    if (!project) throw new Error("Project not found");

    if (project.companyId !== user._id && user.role !== "admin") {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(args.id);
  },
});

// Get projects by company
export const getByCompany = query({
  args: { companyId: v.id("users") },
  handler: async (ctx, args) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .collect();

    return projects;
  },
});

// Intern: request completion on assigned project
export const requestCompletion = mutation({
  args: {
    projectId: v.id("projects"),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "intern") {
      throw new Error("Only interns can request completion");
    }
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");
    if (project.assignedInternId !== user._id) {
      throw new Error("Not authorized to request completion for this project");
    }
    if (project.status !== "in_progress") {
      throw new Error("Project must be in progress to request completion");
    }
    await ctx.db.patch(project._id, {
      completionRequested: true,
      completionNote: args.note,
    });
  },
});

// Company: approve completion → reward intern and mark completed
export const approveCompletion = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const actor = await getCurrentUser(ctx);
    if (!actor || actor.role !== "company") {
      throw new Error("Only companies can approve completion");
    }
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");
    if (project.companyId !== actor._id) {
      throw new Error("Not authorized");
    }
    if (project.status !== "in_progress" || !project.assignedInternId || !project.completionRequested) {
      throw new Error("Project not eligible for approval");
    }

    // Check if company has enough points
    const companyBalance = actor.pointsBalance || 0;
    if (companyBalance < project.pointsReward) {
      throw new Error("Insufficient points to reward intern");
    }

    // Deduct points from company
    await ctx.db.patch(actor._id, {
      pointsBalance: companyBalance - project.pointsReward,
      totalPointsSpent: (actor.totalPointsSpent || 0) + project.pointsReward,
    });

    // Record company transaction
    await ctx.db.insert("transactions", {
      userId: actor._id,
      type: "spend",
      amount: project.pointsReward,
      description: `Paid for completed project: ${project.title}`,
      projectId: project._id,
    });

    // Reward intern
    const intern = await ctx.db.get(project.assignedInternId);
    if (!intern) throw new Error("Assigned intern not found");
    const newBalance = (intern.pointsBalance || 0) + project.pointsReward;
    await ctx.db.patch(intern._id, {
      pointsBalance: newBalance,
      totalPointsEarned: (intern.totalPointsEarned || 0) + project.pointsReward,
    });

    // Record transaction
    await ctx.db.insert("transactions", {
      userId: intern._id,
      type: "earn",
      amount: project.pointsReward,
      description: `Project completed: ${project.title}`,
      projectId: project._id,
    });

    // Mark project completed
    await ctx.db.patch(project._id, {
      status: "completed",
      completedAt: Date.now(),
      completionRequested: false,
      completionNote: undefined,
    });
  },
});

// Company: reject or request rework
export const rejectCompletion = mutation({
  args: {
    projectId: v.id("projects"),
    action: v.union(v.literal("redo"), v.literal("reject")), // redo = ask intern to try again; reject = unassign and reopen
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await getCurrentUser(ctx);
    if (!actor || actor.role !== "company") {
      throw new Error("Only companies can manage completion");
    }
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");
    if (project.companyId !== actor._id) {
      throw new Error("Not authorized");
    }
    if (project.status !== "in_progress" || !project.assignedInternId || !project.completionRequested) {
      throw new Error("Project not eligible to reject/request rework");
    }

    if (args.action === "redo") {
      // Keep assigned intern and in_progress; clear the request note
      await ctx.db.patch(project._id, {
        completionRequested: false,
        completionNote: args.reason || project.completionNote,
      });
      return;
    }

    // Full reject: unassign intern and reopen the project
    await ctx.db.patch(project._id, {
      status: "open",
      assignedInternId: undefined,
      completionRequested: false,
      completionNote: args.reason || undefined,
    });
  },
});