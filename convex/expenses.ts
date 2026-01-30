import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { checkPermissions, logActivity } from "./utils";

export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

export const createExpense = mutation({
    args: {
        title: v.string(),
        amount: v.number(),
        category: v.union(v.literal("Material"), v.literal("Labor"), v.literal("Transport"), v.literal("Other")),
        date: v.number(),
        paidBy: v.string(),
        notes: v.optional(v.string()),
        billStorageId: v.optional(v.array(v.id("_storage"))),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        await checkPermissions(ctx, args.userId, "editor"); // Editor can create

        const expenseId = await ctx.db.insert("expenses", {
            title: args.title,
            amount: args.amount,
            category: args.category,
            date: args.date,
            paidBy: args.paidBy,
            notes: args.notes,
            billStorageId: args.billStorageId,
            createdBy: args.userId,
            createdAt: Date.now(),
            lastModifiedBy: args.userId,
            lastModifiedAt: Date.now(),
            isDeleted: false,
        });

        await logActivity(ctx, "EXPENSE_CREATED", "expense", expenseId, args.userId, `Created expense: ${args.title} of ${args.amount}`);

        return expenseId;
    },
});

export const updateExpense = mutation({
    args: {
        id: v.id("expenses"),
        title: v.string(),
        amount: v.number(),
        category: v.union(v.literal("Material"), v.literal("Labor"), v.literal("Transport"), v.literal("Other")),
        date: v.number(),
        paidBy: v.string(),
        notes: v.optional(v.string()),
        billStorageId: v.optional(v.array(v.id("_storage"))),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        await checkPermissions(ctx, args.userId, "editor"); // Editor can update

        const { id, userId, ...updates } = args;
        const existing = await ctx.db.get(id);
        if (!existing || existing.isDeleted) throw new Error("Expense not found");

        await ctx.db.patch(id, {
            ...updates,
            lastModifiedBy: userId,
            lastModifiedAt: Date.now(),
        });

        await logActivity(ctx, "EXPENSE_UPDATED", "expense", id, userId, `Updated expense: ${existing.title}`);
    }
});

export const getExpenses = query({
    args: {},
    handler: async (ctx) => {
        // Fetch all, including soft-deleted ones? No, user usually wants active.
        const expenses = await ctx.db.query("expenses").collect();
        const activeExpenses = expenses.filter(e => !e.isDeleted).sort((a, b) => b.date - a.date).slice(0, 100);

        const enriched = await Promise.all(activeExpenses.map(async (exp) => {
            const creator = await ctx.db.get(exp.createdBy);
            const editor = exp.lastModifiedBy ? await ctx.db.get(exp.lastModifiedBy) : null;

            let billUrls: string[] = [];
            if (exp.billStorageId) {
                // Handle both single ID (legacy) and array of IDs
                const ids = Array.isArray(exp.billStorageId) ? exp.billStorageId : [exp.billStorageId];
                const urls = await Promise.all(ids.map(id => ctx.storage.getUrl(id)));
                billUrls = urls.filter(u => u !== null) as string[];
            }

            return {
                ...exp,
                creatorName: creator?.name || "Unknown",
                editorName: editor?.name || "Unknown",
                billUrls
            };
        }));

        return enriched;
    }
});

export const getExpense = query({
    args: { id: v.id("expenses") },
    handler: async (ctx, args) => {
        const expense = await ctx.db.get(args.id);
        if (!expense || expense.isDeleted) return null;

        const creator = await ctx.db.get(expense.createdBy);
        const editor = expense.lastModifiedBy ? await ctx.db.get(expense.lastModifiedBy) : null;

        let billUrls: string[] = [];
        if (expense.billStorageId) {
            // Handle both single ID (legacy) and array of IDs
            const ids = Array.isArray(expense.billStorageId) ? expense.billStorageId : [expense.billStorageId];
            const urls = await Promise.all(ids.map(id => ctx.storage.getUrl(id)));
            billUrls = urls.filter(u => u !== null) as string[];
        }

        return {
            ...expense,
            creatorName: creator?.name || "Unknown",
            editorName: editor?.name || "Unknown",
            billUrls
        };
    }
});

export const deleteExpense = mutation({
    args: { id: v.id("expenses"), userId: v.id("users") },
    handler: async (ctx, args) => {
        // Only OWNER can delete
        await checkPermissions(ctx, args.userId, "owner");

        const existing = await ctx.db.get(args.id);
        if (!existing || existing.isDeleted) throw new Error("Expense not found");

        // Soft Delete
        await ctx.db.patch(args.id, {
            isDeleted: true,
            lastModifiedBy: args.userId,
            lastModifiedAt: Date.now()
        });

        await logActivity(ctx, "EXPENSE_DELETED", "expense", args.id, args.userId, `Soft Deleted expense: ${existing.title}`);
    }
});
