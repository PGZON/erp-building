import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { checkPermissions, logActivity } from "./utils";

export const createVendor = mutation({
    args: {
        name: v.string(),
        contact: v.optional(v.string()),
        type: v.union(v.literal("Supplier"), v.literal("Contractor"), v.literal("Service"), v.literal("Other")),
        notes: v.optional(v.string()),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        await checkPermissions(ctx, args.userId, "editor");

        const vendorId = await ctx.db.insert("vendors", {
            name: args.name,
            contact: args.contact,
            type: args.type,
            notes: args.notes,
            active: true,
            isDeleted: false,
            createdBy: args.userId,
            createdAt: Date.now(),
            lastModifiedBy: args.userId,
            lastModifiedAt: Date.now()
        });

        await logActivity(ctx, "VENDOR_CREATED", "vendor", vendorId, args.userId, `Created vendor: ${args.name}`);
        return vendorId;
    }
});

export const getVendors = query({
    handler: async (ctx) => {
        const all = await ctx.db.query("vendors").collect();
        return all.filter(v => !v.isDeleted).sort((a, b) => b.createdAt - a.createdAt);
    }
});

export const getVendorDetails = query({
    args: { id: v.id("vendors") },
    handler: async (ctx, args) => {
        const vendor = await ctx.db.get(args.id);
        if (!vendor || vendor.isDeleted) return null;

        // Get linked expenses (Active only)
        const expenses = await ctx.db
            .query("expenses")
            .withIndex("by_vendor", (q) => q.eq("vendorId", args.id))
            .collect();

        const activeExpenses = expenses.filter(e => !e.isDeleted);
        const totalPaid = activeExpenses.reduce((sum, exp) => sum + exp.amount, 0);

        return {
            ...vendor,
            totalPaid,
            expenses: activeExpenses.sort((a, b) => b.date - a.date)
        };
    }
});
