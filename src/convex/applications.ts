import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Apply to a project
export const create = mutation({
  args: {
    projectId: v.id("projects"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "intern") {
      throw new Error("Only interns can apply to projects");
    }

    // Check if already applied
    const existing = await ctx.db
      .query("applications")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.eq(q.field("internId"), user._id))
      .first();

    if (existing) {
      throw new Error("Already applied to this project");
    }

    const applicationId = await ctx.db.insert("applications", {
      projectId: args.projectId,
      internId: user._id,
      status: "pending",
      message: args.message,
    });

    return applicationId;
  },
});

// Get applications for a project
export const getByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const applicationsWithIntern = await Promise.all(
      applications.map(async (app) => {
        const intern = await ctx.db.get(app.internId);
        return {
          ...app,
          internName: intern?.name || intern?.email || "Unknown",
          internImage: intern?.image,
          internSkills: intern?.skills || [],
        };
      })
    );

    return applicationsWithIntern;
  },
});

// Get applications by intern
export const getByIntern = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const applications = await ctx.db
      .query("applications")
      .withIndex("by_intern", (q) => q.eq("internId", user._id))
      .collect();

    const applicationsWithProject = await Promise.all(
      applications.map(async (app) => {
        const project = await ctx.db.get(app.projectId);
        const company = project ? await ctx.db.get(project.companyId) : null;
        return {
          ...app,
          project,
          companyName: company?.name || company?.email || "Unknown",
        };
      })
    );

    return applicationsWithProject;
  },
});

// Accept/reject application
export const updateStatus = mutation({
  args: {
    applicationId: v.id("applications"),
    status: v.union(v.literal("accepted"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const application = await ctx.db.get(args.applicationId);
    if (!application) throw new Error("Application not found");

    const project = await ctx.db.get(application.projectId);
    if (!project) throw new Error("Project not found");

    if (project.companyId !== user._id && user.role !== "admin") {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.applicationId, { status: args.status });

    if (args.status === "accepted") {
      await ctx.db.patch(application.projectId, {
        assignedInternId: application.internId,
        status: "in_progress",
      });
    }
  },
});
