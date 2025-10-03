import { internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Check if data already exists
    const existingPackages = await ctx.db.query("pointPackages").first();
    if (!existingPackages) {
      // Create point packages
      await ctx.db.insert("pointPackages", {
        name: "Starter Pack",
        points: 100,
        price: 10,
        description: "Perfect for small projects",
        isActive: true,
      });

      await ctx.db.insert("pointPackages", {
        name: "Pro Pack",
        points: 500,
        price: 45,
        description: "Best value for growing teams",
        isActive: true,
      });

      await ctx.db.insert("pointPackages", {
        name: "Enterprise Pack",
        points: 1000,
        price: 80,
        description: "For large-scale operations",
        isActive: true,
      });

      console.log("✅ Created point packages");
    }

    // Seed sample users if none
    const usersAny = await ctx.db.query("users").first();
    let companyId: Id<"users"> | null = null;
    let adminId: Id<"users"> | null = null;
    let internId: Id<"users"> | null = null;
    if (!usersAny) {
      adminId = await ctx.db.insert("users", {
        email: "admin@demo.local",
        name: "admin",
        role: "admin" as any,
        pointsBalance: 0,
        totalPointsEarned: 0,
        totalPointsSpent: 0,
      });
      companyId = await ctx.db.insert("users", {
        email: "company_1@demo.local",
        name: "company_1",
        role: "company" as any,
        pointsBalance: 1000,
        totalPointsEarned: 0,
        totalPointsSpent: 0,
      });
      internId = await ctx.db.insert("users", {
        email: "intern_1@demo.local",
        name: "intern_1",
        role: "intern" as any,
        pointsBalance: 0,
        totalPointsEarned: 0,
        totalPointsSpent: 0,
        skills: ["React", "Design"],
      });
      console.log("✅ Seeded users (use email OTP): admin@demo.local, company_1@demo.local, intern_1@demo.local");
    } else {
      // Try to find any company/admin/intern
      const allUsers = await ctx.db.query("users").collect();
      adminId = (allUsers.find((u) => u.role === "admin")?._id || null) as any;
      companyId = (allUsers.find((u) => u.role === "company")?._id || null) as any;
      internId = (allUsers.find((u) => u.role === "intern")?._id || null) as any;
    }

    // Seed projects if none
    const anyProject = await ctx.db.query("projects").first();
    if (!anyProject && companyId) {
      const samples = [
        {
          title: "Landing Page Revamp",
          description: "Redesign our marketing landing page with modern UI.",
          pointsReward: 150,
          category: "design",
          difficulty: "beginner",
          duration: "1-2 weeks",
          requirements: ["Figma", "Responsive design"],
        },
        {
          title: "Build Analytics Dashboard",
          description: "Create a dashboard with charts and filters.",
          pointsReward: 400,
          category: "development",
          difficulty: "intermediate",
          duration: "2-3 weeks",
          requirements: ["React", "APIs", "Charts"],
        },
        {
          title: "SEO Content Writing",
          description: "Write optimized blog posts for our product.",
          pointsReward: 120,
          category: "marketing",
          difficulty: "beginner",
          duration: "1 week",
          requirements: ["Content writing", "SEO basics"],
        },
        {
          title: "Mobile App Prototype",
          description: "Prototype a mobile app flow with interactions.",
          pointsReward: 300,
          category: "design",
          difficulty: "advanced",
          duration: "3-4 weeks",
          requirements: ["Figma", "Prototyping"],
        },
      ];
      for (const p of samples) {
        await ctx.db.insert("projects", { ...p, companyId, status: "open" as any });
      }
      console.log("✅ Seeded sample projects");
    }

    // Seed courses if none
    const anyCourse = await ctx.db.query("courses").first();
    if (!anyCourse && (adminId || companyId)) {
      const uploader = adminId || companyId!;
      const courses = [
        {
          title: "Intro to React",
          description: "Components, props, and state management basics.",
          category: "development",
          videoUrl: "https://www.youtube.com/watch?v=Ke90Tje7VS0",
          duration: "1h 30m",
          isApproved: true,
          price: 150,
        },
        {
          title: "Design Systems 101",
          description: "Foundations of reusable UI and accessibility.",
          category: "design",
          videoUrl: "https://www.youtube.com/watch?v=_4J3m5iK8eE",
          duration: "55m",
          isApproved: true,
          price: 120,
        },
        {
          title: "Marketing Fundamentals",
          description: "Understand funnels, ICPs, and messaging.",
          category: "business",
          videoUrl: "https://www.youtube.com/watch?v=0yWgAQ2H7Hc",
          duration: "1h 10m",
          isApproved: true,
          price: 100,
        },
        // Added per request
        {
          title: "SOC Essentials",
          description: "Security Operations Center fundamentals and workflows.",
          category: "security",
          videoUrl: "https://www.youtube.com/watch?v=56NDgBOSpUg",
          duration: "2h",
          isApproved: true,
          price: 200,
        },
        {
          title: "Unreal Engine 4 Course",
          description: "Getting started building with Unreal Engine 4.",
          category: "development",
          videoUrl: "https://youtu.be/6UlU_FsicK8",
          duration: "3h",
          isApproved: true,
          price: 250,
        },
        {
          title: "101: Security Basics",
          description: "Security 101 concepts for beginners.",
          category: "security",
          videoUrl: "https://youtu.be/56NDgBOSpUg",
          duration: "1h 30m",
          isApproved: true,
          price: 130,
        },
        {
          title: "GRC Overview",
          description: "Governance, Risk, and Compliance explained.",
          category: "security",
          videoUrl: "https://www.youtube.com/watch?v=JswwHeEqBIc&t=1457s",
          duration: "1h 45m",
          isApproved: true,
          price: 180,
        },
        {
          title: "Stock Market Fundamentals",
          description: "Understand market basics, instruments, and strategies.",
          category: "business",
          videoUrl: "https://youtu.be/3WI9RZODuag?list=PLxNHpNhDaEFJsuzKNrMbr_SESDCCLmSu4",
          duration: "2h 20m",
          isApproved: true,
          price: 220,
        },
      ];
      for (const c of courses) {
        await ctx.db.insert("courses", { ...c, uploadedBy: uploader as any });
      }
      console.log("✅ Seeded sample courses (with price)");
    }

    // Note: Users will be created through authentication
    // Projects, courses, and other data will be created by users through the UI
    
    console.log("✅ Database seeded successfully!");
  },
});

// Add-on: Insert/update specific YouTube courses with low coin prices (20–30 pts)
export const addCourses = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Find an uploader (prefer admin, fallback to any user, otherwise create a seed admin)
    let uploader = await ctx.db.query("users").collect();
    let uploaderId =
      (uploader.find((u) => u.role === "admin")?._id as Id<"users"> | undefined) ||
      (uploader[0]?._id as Id<"users"> | undefined);

    if (!uploaderId) {
      uploaderId = await ctx.db.insert("users", {
        email: "admin_seed@demo.local",
        name: "seed_admin",
        role: "admin" as any,
        pointsBalance: 0,
        totalPointsEarned: 0,
        totalPointsSpent: 0,
      });
      console.log("✅ Created seed admin user for course uploads");
    }

    const desiredCourses: Array<{
      title: string;
      description: string;
      category: string;
      videoUrl: string;
      duration?: string;
      price: number;
    }> = [
      {
        title: "SOC Essentials",
        description: "Security Operations Center fundamentals and workflows.",
        category: "security",
        videoUrl: "https://www.youtube.com/watch?v=56NDgBOSpUg",
        duration: "2h",
        price: 20,
      },
      {
        title: "Unreal Engine 4 Course",
        description: "Getting started building with Unreal Engine 4.",
        category: "development",
        videoUrl: "https://youtu.be/6UlU_FsicK8",
        duration: "3h",
        price: 30,
      },
      {
        title: "101: Security Basics",
        description: "Security 101 concepts for beginners.",
        category: "security",
        videoUrl: "https://youtu.be/56NDgBOSpUg",
        duration: "1h 30m",
        price: 20,
      },
      {
        title: "GRC Overview",
        description: "Governance, Risk, and Compliance explained.",
        category: "security",
        videoUrl: "https://www.youtube.com/watch?v=JswwHeEqBIc&t=1457s",
        duration: "1h 45m",
        price: 25,
      },
      {
        title: "Stock Market Fundamentals",
        description: "Understand market basics, instruments, and strategies.",
        category: "business",
        videoUrl: "https://youtu.be/3WI9RZODuag?list=PLxNHpNhDaEFJsuzKNrMbr_SESDCCLmSu4",
        duration: "2h 20m",
        price: 30,
      },
    ];

    // Insert any missing courses (match by title)
    const existing = await ctx.db.query("courses").collect();
    const existingTitles = new Set(existing.map((c) => c.title));

    let createdCount = 0;
    for (const c of desiredCourses) {
      if (existingTitles.has(c.title)) continue;
      await ctx.db.insert("courses", {
        title: c.title,
        description: c.description,
        category: c.category,
        videoUrl: c.videoUrl,
        duration: c.duration,
        uploadedBy: uploaderId,
        isApproved: true,
        price: c.price,
      });
      createdCount++;
    }

    if (createdCount > 0) {
      console.log(`✅ Added ${createdCount} course(s) with low coin prices for interns.`);
    } else {
      console.log("ℹ️ All target courses already exist. No new courses added.");
    }
  },
});