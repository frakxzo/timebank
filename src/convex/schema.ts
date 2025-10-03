import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// User roles for TimeBank
export const ROLES = {
  ADMIN: "admin",
  COMPANY: "company",
  INTERN: "intern",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.COMPANY),
  v.literal(ROLES.INTERN),
);
export type Role = Infer<typeof roleValidator>;

// Project status
export const PROJECT_STATUS = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export const projectStatusValidator = v.union(
  v.literal(PROJECT_STATUS.OPEN),
  v.literal(PROJECT_STATUS.IN_PROGRESS),
  v.literal(PROJECT_STATUS.COMPLETED),
  v.literal(PROJECT_STATUS.CANCELLED),
);

const schema = defineSchema(
  {
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
      // Add ban flag for admin moderation
      isBanned: v.optional(v.boolean()),
      
      // Additional profile fields
      bio: v.optional(v.string()),
      company: v.optional(v.string()),
      skills: v.optional(v.array(v.string())),
      location: v.optional(v.string()),
      website: v.optional(v.string()),
      
      // Points balance
      pointsBalance: v.optional(v.number()),
      totalPointsEarned: v.optional(v.number()),
      totalPointsSpent: v.optional(v.number()),
    }).index("email", ["email"]),

    // Projects posted by companies
    projects: defineTable({
      title: v.string(),
      description: v.string(),
      companyId: v.id("users"),
      pointsReward: v.number(),
      status: projectStatusValidator,
      category: v.string(),
      difficulty: v.string(),
      duration: v.string(),
      requirements: v.array(v.string()),
      assignedInternId: v.optional(v.id("users")),
      completedAt: v.optional(v.number()),
      // Add completion request fields
      completionRequested: v.optional(v.boolean()),
      completionNote: v.optional(v.string()),
    })
      .index("by_company", ["companyId"])
      .index("by_status", ["status"])
      .index("by_assigned_intern", ["assignedInternId"]),

    // Point packages for companies to purchase
    pointPackages: defineTable({
      name: v.string(),
      points: v.number(),
      price: v.number(),
      description: v.string(),
      isActive: v.boolean(),
    }),

    // Transactions for point purchases and earnings
    transactions: defineTable({
      userId: v.id("users"),
      type: v.union(v.literal("purchase"), v.literal("earn"), v.literal("spend")),
      amount: v.number(),
      description: v.string(),
      projectId: v.optional(v.id("projects")),
      packageId: v.optional(v.id("pointPackages")),
    }).index("by_user", ["userId"]),

    // Project applications from interns
    applications: defineTable({
      projectId: v.id("projects"),
      internId: v.id("users"),
      status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("rejected")),
      message: v.string(),
      // Optional applicant email provided at apply time
      applicantEmail: v.optional(v.string()),
    })
      .index("by_project", ["projectId"])
      .index("by_intern", ["internId"]),

    // Courses for interns (accessible by admin and intern)
    courses: defineTable({
      title: v.string(),
      description: v.string(),
      category: v.string(),
      videoUrl: v.optional(v.string()),
      videoStorageId: v.optional(v.id("_storage")),
      thumbnailUrl: v.optional(v.string()),
      duration: v.optional(v.string()),
      uploadedBy: v.id("users"),
      // New: approval gate for content submitted by interns
      isApproved: v.optional(v.boolean()),
      // Add: price in points to purchase course
      price: v.optional(v.number()),
    })
      .index("by_category", ["category"])
      .index("by_uploader", ["uploadedBy"]),

    // Add: Course purchases (ownership) tracking
    coursePurchases: defineTable({
      courseId: v.id("courses"),
      userId: v.id("users"),
      pricePaid: v.number(),
      purchasedAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_course", ["courseId"])
      .index("by_user_and_course", ["userId", "courseId"]),

    // Course progress tracking
    courseProgress: defineTable({
      courseId: v.id("courses"),
      userId: v.id("users"),
      completed: v.boolean(),
      progress: v.number(),
      lastWatchedAt: v.optional(v.number()),
    })
      .index("by_user", ["userId"])
      .index("by_course", ["courseId"])
      .index("by_user_and_course", ["userId", "courseId"]),

    // Add: Per-course videos (URL or uploaded file)
    courseVideos: defineTable({
      courseId: v.id("courses"),
      addedBy: v.id("users"),
      title: v.string(),
      description: v.optional(v.string()),
      // Either a remote URL (e.g., YouTube) or an uploaded file
      videoUrl: v.optional(v.string()),
      fileId: v.optional(v.id("_storage")),
      order: v.optional(v.number()),
    }).index("by_course", ["courseId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;