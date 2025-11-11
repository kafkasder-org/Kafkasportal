import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List tasks with filters
export const list = query({
  args: {
    limit: v.optional(v.number()),
    skip: v.optional(v.number()),
    status: v.optional(v.string()),
    assigned_to: v.optional(v.id("users")),
    created_by: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let tasks;
    
    if (args.status) {
      tasks = await ctx.db
        .query("tasks")
        .withIndex("by_status", (q) => q.eq("status", args.status as "pending" | "in_progress" | "completed" | "cancelled"))
        .collect();
    } else if (args.assigned_to) {
      tasks = await ctx.db
        .query("tasks")
        .withIndex("by_assigned_to", (q) => q.eq("assigned_to", args.assigned_to))
        .collect();
    } else if (args.created_by) {
      tasks = await ctx.db
        .query("tasks")
        .withIndex("by_created_by", (q) => q.eq("created_by", args.created_by!))
        .collect();
    } else {
      tasks = await ctx.db.query("tasks").collect();
    }

    const skip = args.skip || 0;
    const limit = args.limit || 50;
    const paginated = tasks.slice(skip, skip + limit);

    return {
      documents: paginated,
      total: tasks.length,
    };
  },
});

// Get task by ID
export const get = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create task
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    assigned_to: v.optional(v.id("users")),
    created_by: v.id("users"),
    priority: v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("urgent")
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    due_date: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    is_read: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tasks", args);
  },
});

// Update task
export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    assigned_to: v.optional(v.id("users")),
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("normal"),
        v.literal("high"),
        v.literal("urgent")
      )
    ),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("in_progress"),
        v.literal("completed"),
        v.literal("cancelled")
      )
    ),
    due_date: v.optional(v.string()),
    completed_at: v.optional(v.string()),
    is_read: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const task = await ctx.db.get(id);
    if (!task) {
      throw new Error("Task not found");
    }

    // Auto-set completed_at when status is completed
    if (updates.status === "completed" && !updates.completed_at) {
      updates.completed_at = new Date().toISOString();
    }

    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

// Delete task
export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) {
      throw new Error("Task not found");
    }
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

