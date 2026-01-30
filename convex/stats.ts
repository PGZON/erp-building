import { v } from "convex/values";
import { query } from "./_generated/server";

export const getDashboardStats = query({
    args: {},
    handler: async (ctx) => {
        // 1. Fetch all expenses (Optimized for small-medium scale; for large scale, use manual aggregations in a separate table)
        const expenses = await ctx.db.query("expenses").collect();

        let totalSpent = 0;
        let monthlySpent = 0;
        const categoryTotals: Record<string, number> = {
            Material: 0,
            Labor: 0,
            Transport: 0,
            Other: 0
        };

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        for (const exp of expenses) {
            totalSpent += exp.amount;

            const expDate = new Date(exp.date);
            if (expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear) {
                monthlySpent += exp.amount;
            }

            if (categoryTotals[exp.category] !== undefined) {
                categoryTotals[exp.category] += exp.amount;
            } else {
                // Fallback
                categoryTotals['Other'] += exp.amount;
            }
        }

        // 2. Counts
        const materialsCount = (await ctx.db.query("materials").take(1)).length > 0
            ? (await ctx.db.query("materials").collect()).length // Inefficient for huge data, okay for < 10k
            : 0;
        // Optimization: Convex doesn't have count(), so we collect. 
        // For Production: Maintain a "counters" table incremented via mutations.
        // For this Phase: collect() is fine.

        const vendorsCount = (await ctx.db.query("vendors").collect()).length;

        return {
            totalSpent,
            monthlySpent,
            categoryTotals,
            materialsCount,
            vendorsCount
        };
    },
});

export const getRecentActivity = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const limit = args.limit || 20;
        const logs = await ctx.db.query("audit_logs").order("desc").take(limit);

        return await Promise.all(logs.map(async (log) => {
            const user = await ctx.db.get(log.userId);
            return {
                ...log,
                userName: user?.name || "Unknown User"
            };
        }));
    }
});
