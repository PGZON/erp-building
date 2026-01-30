import { Id } from "./_generated/dataModel";
import { MutationCtx, QueryCtx } from "./_generated/server";

export async function checkPermissions(ctx: MutationCtx | QueryCtx, userId: Id<"users">, requiredRole: "owner" | "editor" | "viewer") {
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    if (requiredRole === "owner" && user.role !== "owner") {
        throw new Error("Permission Denied: Owner access required");
    }

    if (requiredRole === "editor") {
        if (user.role !== "owner" && user.role !== "editor") {
            throw new Error("Permission Denied: Editor access required");
        }
    }

    // Viewer can do anything that an Editor can't? 
    // Usually we check if they are AT LEAST the role.
    return user;
}

export async function logActivity(ctx: MutationCtx, action: string, entity: string, entityId: string, userId: Id<"users">, details?: string) {
    await ctx.db.insert("audit_logs", {
        action,
        entity,
        entityId,
        userId,
        details,
        timestamp: Date.now(),
    });
}
