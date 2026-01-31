import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getNotes = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("notes")
            .filter((q) => q.neq(q.field("isDeleted"), true))
            .order("desc")
            .collect();
    },
});

export const addNote = mutation({
    args: {
        content: v.string(),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("notes", {
            content: args.content,
            userId: args.userId,
            createdAt: Date.now(),
        });
    },
});

export const deleteNote = mutation({
    args: { id: v.id("notes") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { isDeleted: true });
    },
});
