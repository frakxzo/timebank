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

    // Only show approved courses to interns; admins see all in this list
    if (user.role !== "admin") {
      courses = courses.filter((c) => c.isApproved !== false);
    }

    if (args.category && args.category !== "all") {
      courses = courses.filter((c) => c.category === args.category);
    }

    // Get uploader info, progress for current user, and ownership
    const coursesWithDetails = await Promise.all(
      courses.map(async (course) => {
        const uploader = await ctx.db.get(course.uploadedBy);
        const progress = await ctx.db
          .query("courseProgress")
          .withIndex("by_user_and_course", (q) =>
            q.eq("userId", user._id).eq("courseId", course._id)
          )
          .first();

        // Check if user owns the course
        const owned = await ctx.db
          .query("coursePurchases")
          .withIndex("by_user_and_course", (q) =>
            q.eq("userId", user._id).eq("courseId", course._id)
          )
          .first();

        return {
          ...course,
          uploaderName: uploader?.name || uploader?.email || "Unknown",
          userProgress: progress?.progress || 0,
          userCompleted: progress?.completed || false,
          isOwned: !!owned,
          price: course.price ?? 0,
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
      isApproved: true,
    });

    return courseId;
  },
});

// Submit course (interns) - requires admin approval
export const submit = mutation({
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
    if (!user || user.role !== "intern") {
      throw new Error("Only interns can submit courses");
    }
    // Create unapproved course entry
    const courseId = await ctx.db.insert("courses", {
      ...args,
      uploadedBy: user._id,
      isApproved: false,
    });
    return courseId;
  },
});

// Admin: list pending submissions
export const listPending = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Only admins can view pending courses");
    }
    const pending = await ctx.db.query("courses").collect();
    return pending.filter((c) => c.isApproved === false);
  },
});

// Admin: approve submission
export const approve = mutation({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Only admins can approve courses");
    }
    await ctx.db.patch(args.courseId, { isApproved: true });
  },
});

// Admin: remove course/submission
export const remove = mutation({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Only admins can remove courses");
    }
    await ctx.db.delete(args.courseId);
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

// Add: purchase a course (interns spend coins)
export const purchase = mutation({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "intern") {
      throw new Error("Only interns can purchase courses");
    }
    const course = await ctx.db.get(args.courseId);
    if (!course) throw new Error("Course not found");
    if (course.isApproved === false) throw new Error("Course is not available");
    const price = course.price ?? 0;
    if (price <= 0) throw new Error("Course is not for sale");

    // Check already owned
    const existing = await ctx.db
      .query("coursePurchases")
      .withIndex("by_user_and_course", (q) =>
        q.eq("userId", user._id).eq("courseId", course._id)
      )
      .first();
    if (existing) {
      throw new Error("You already own this course");
    }

    const balance = user.pointsBalance || 0;
    if (balance < price) {
      throw new Error("Insufficient points");
    }

    // Deduct points
    await ctx.db.patch(user._id, {
      pointsBalance: balance - price,
      totalPointsSpent: (user.totalPointsSpent || 0) + price,
    });

    // Record transaction
    await ctx.db.insert("transactions", {
      userId: user._id,
      type: "spend",
      amount: price,
      description: `Purchased course: ${course.title}`,
    });

    // Record ownership
    await ctx.db.insert("coursePurchases", {
      courseId: course._id,
      userId: user._id,
      pricePaid: price,
      purchasedAt: Date.now(),
    });
  },
});

// Add: admin update course (content/price/approval)
export const adminUpdate = mutation({
  args: {
    courseId: v.id("courses"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    duration: v.optional(v.string()),
    price: v.optional(v.number()),
    isApproved: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Only admins can update courses");
    }
    const { courseId, ...updates } = args;
    await ctx.db.patch(courseId, updates);
  },
});