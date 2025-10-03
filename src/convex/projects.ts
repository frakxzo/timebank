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
