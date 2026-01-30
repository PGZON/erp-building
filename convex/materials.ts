import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { checkPermissions, logActivity } from "./utils";

export const createMaterial = mutation({
    args: {
        name: v.string(),
        category: v.optional(v.string()),
        quantity: v.number(),
        unit: v.string(),
        cost: v.number(),
        date: v.number(),
        expenseId: v.optional(v.id("expenses")),
        vendorId: v.optional(v.id("vendors")),
        notes: v.optional(v.string()),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        await checkPermissions(ctx, args.userId, "editor");

        const materialId = await ctx.db.insert("materials", {
            name: args.name,
            category: args.category,
            quantity: args.quantity,
            unit: args.unit,
            cost: args.cost,
            date: args.date,
            expenseId: args.expenseId,
            vendorId: args.vendorId,
            notes: args.notes,
            createdBy: args.userId,
            createdAt: Date.now(),
            lastModifiedBy: args.userId,
            lastModifiedAt: Date.now(),
            isDeleted: false,
        });

        await logActivity(ctx, "MATERIAL_ADDED", "material", materialId, args.userId, `Added material: ${args.quantity} ${args.unit} of ${args.name}`);
        return materialId;
    }
});

export const getMaterials = query({
    handler: async (ctx) => {
        const materials = await ctx.db.query("materials").collect();
        const active = materials.filter(m => !m.isDeleted).sort((a, b) => b.date - a.date).slice(0, 100);

        // Enrich
        return await Promise.all(active.map(async (mat) => {
            const vendor = mat.vendorId ? await ctx.db.get(mat.vendorId) : null;
            const creator = await ctx.db.get(mat.createdBy);
            return {
                ...mat,
                vendorName: vendor?.name,
                creatorName: creator?.name
            };
        }));
    }
});
