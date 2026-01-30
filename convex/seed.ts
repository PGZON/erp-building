import { mutation } from "./_generated/server";

export const createAdmin = mutation({
    args: {},
    handler: async (ctx) => {
        const anyUser = await ctx.db.query("users").first();
        if (anyUser) {
            return "Users already exist. Skipping seed.";
        }

        await ctx.db.insert("users", {
            email: "admin@example.com",
            password: "password123",
            name: "Admin User",
            role: "owner",
            createdAt: Date.now()
        });
        return "Admin user created: admin@example.com / password123";
    }
});
