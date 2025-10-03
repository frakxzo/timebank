import { internalMutation } from "./_generated/server";

export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Check if data already exists
    const existingPackages = await ctx.db.query("pointPackages").first();
    if (existingPackages) {
      console.log("Database already seeded");
      return;
    }

    // Create point packages
    const starterPackage = await ctx.db.insert("pointPackages", {
      name: "Starter Pack",
      points: 100,
      price: 10,
      description: "Perfect for small projects",
      isActive: true,
    });

    const proPackage = await ctx.db.insert("pointPackages", {
      name: "Pro Pack",
      points: 500,
      price: 45,
      description: "Best value for growing teams",
      isActive: true,
    });

    const enterprisePackage = await ctx.db.insert("pointPackages", {
      name: "Enterprise Pack",
      points: 1000,
      price: 80,
      description: "For large-scale operations",
      isActive: true,
    });

    console.log("✅ Created point packages");

    // Note: Users will be created through authentication
    // Projects, courses, and other data will be created by users through the UI
    
    console.log("✅ Database seeded successfully!");
  },
});
