import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        email: v.string(),
        password: v.string(),
        name: v.string(),
        role: v.union(v.literal("owner"), v.literal("editor"), v.literal("viewer")),
        createdAt: v.number(),
    }).index("by_email", ["email"]),

    vendors: defineTable({
        name: v.string(),
        contact: v.optional(v.string()),
        type: v.union(v.literal("Supplier"), v.literal("Contractor"), v.literal("Service"), v.literal("Other")),
        notes: v.optional(v.string()),
        active: v.boolean(),
        isDeleted: v.optional(v.boolean()),

        // Audit
        createdBy: v.id("users"),
        createdAt: v.number(),
        lastModifiedBy: v.optional(v.id("users")),
        lastModifiedAt: v.optional(v.number()),
    }).index("by_name", ["name"]),

    expenses: defineTable({
        title: v.string(),
        amount: v.number(),
        category: v.union(v.literal("Material"), v.literal("Labor"), v.literal("Transport"), v.literal("Other")),
        date: v.number(),
        paidBy: v.string(),
        vendorId: v.optional(v.id("vendors")),
        notes: v.optional(v.string()),
        billStorageId: v.optional(v.array(v.id("_storage"))),
        isDeleted: v.optional(v.boolean()),

        // Audit Fields
        createdBy: v.id("users"),
        createdAt: v.number(),
        lastModifiedBy: v.optional(v.id("users")),
        lastModifiedAt: v.optional(v.number()),
    })
        .index("by_date", ["date"])
        .index("by_vendor", ["vendorId"]),

    materials: defineTable({
        name: v.string(),
        category: v.optional(v.string()),
        quantity: v.number(),
        unit: v.string(),
        cost: v.number(),
        date: v.number(),

        expenseId: v.optional(v.id("expenses")),
        vendorId: v.optional(v.id("vendors")),

        notes: v.optional(v.string()),
        isDeleted: v.optional(v.boolean()),

        // Audit
        createdBy: v.id("users"),
        createdAt: v.number(),
        lastModifiedBy: v.optional(v.id("users")),
        lastModifiedAt: v.optional(v.number()),
    })
        .index("by_date", ["date"])
        .index("by_expense", ["expenseId"])
        .index("by_vendor", ["vendorId"]),

    audit_logs: defineTable({
        action: v.string(),
        entity: v.string(),
        entityId: v.string(),
        userId: v.id("users"),
        details: v.optional(v.string()),
        timestamp: v.number(),
    }).index("by_timestamp", ["timestamp"]),
});
