import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get all courses
export const list = query({
  args: {
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || (user.role !== "intern" && user.role !== "admin")) {
      throw new Error("Only interns and admins can view courses");
    }

    let courses = await ctx.db.query("courses").collect();

    if (args.category && args.category !== "all") {
      courses = courses.filter((c) => c.category === args.category);
    }

    // Get uploader info and progress for current user
    const coursesWithDetails = await Promise.all(
      courses.map(async (course) => {
        const uploader = await ctx.db.get(course.uploadedBy);
        const progress = await ctx.db
          .query("courseProgress")
          .withIndex("by_user_and_course", (q) =>
            q.eq("userId", user._id).eq("courseId", course._id)
          )
          .first();

        return {
          ...course,
          uploaderName: uploader?.name || uploader?.email || "Unknown",
          userProgress: progress?.progress || 0,
          userCompleted: progress?.completed || false,
        };
      })
    );

    return coursesWithDetails;
  },
});

// Get course by ID
export const getById = query({
  args: { id: v.id("courses") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || (user.role !== "intern" && user.role !== "admin")) {
      throw new Error("Only interns and admins can view courses");
    }

    const course = await ctx.db.get(args.id);
    if (!course) return null;

    const uploader = await ctx.db.get(course.uploadedBy);
    const progress = await ctx.db
      .query("courseProgress")
      .withIndex("by_user_and_course", (q) =>
        q.eq("userId", user._id).eq("courseId", course._id)
      )
      .first();

    return {
      ...course,
      uploaderName: uploader?.name || uploader?.email || "Unknown",
      userProgress: progress?.progress || 0,
      userCompleted: progress?.completed || false,
    };
  },
});

// Create course (admin only)
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    videoUrl: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    duration: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Only admins can create courses");
    }

    const courseId = await ctx.db.insert("courses", {
      ...args,
      uploadedBy: user._id,
    });

    return courseId;
  },
});

// Update course progress
export const updateProgress = mutation({
  args: {
    courseId: v.id("courses"),
    progress: v.number(),
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("courseProgress")
      .withIndex("by_user_and_course", (q) =>
        q.eq("userId", user._id).eq("courseId", args.courseId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        progress: args.progress,
        completed: args.completed,
        lastWatchedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("courseProgress", {
        courseId: args.courseId,
        userId: user._id,
        progress: args.progress,
        completed: args.completed,
        lastWatchedAt: Date.now(),
      });
    }
  },
});

// Generate upload URL for video
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Only admins can upload videos");
    }
    return await ctx.storage.generateUploadUrl();
  },
});
