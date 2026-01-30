import { v } from "convex/values";
import { mutation } from "./_generated/server";

// In a real production app, use 'bcryptjs' or Web Crypto API for hashing.
// For this Phase 1 Foundation, we will simulate the hash check to ensure architecture is correct.
// We will treat the stored password as the "hash" for now.

export const login = mutation({
    args: { email: v.string(), password: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .unique();

        if (!user) {
            console.log("User not found:", args.email);
            return null;
        }

        // Hash comparison logic would go here.
        // For now, we compare directly.
        if (user.password !== args.password) {
            console.log("Invalid password for:", args.email);
            return null;
        }

        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };
    },
});

export const createAccount = mutation({
    args: {
        email: v.string(),
        password: v.string(),
        name: v.string(),
        role: v.union(v.literal("owner"), v.literal("editor"), v.literal("viewer")),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (existing) {
            throw new Error("User already exists");
        }

        const userId = await ctx.db.insert("users", {
            email: args.email,
            password: args.password, // Should be hashed in production
            name: args.name,
            role: args.role,
            createdAt: Date.now(),
        });

        return userId;
    },
});
