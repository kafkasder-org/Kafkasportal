import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List meetings with filters
export const list = query({
  args: {
    limit: v.optional(v.number()),
    skip: v.optional(v.number()),
    status: v.optional(v.string()),
    organizer: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let meetings;
    
    if (args.status) {
      meetings = await ctx.db
        .query("meetings")
        .withIndex("by_status", (q) => q.eq("status", args.status as "scheduled" | "ongoing" | "completed" | "cancelled"))
        .collect();
    } else if (args.organizer) {
      meetings = await ctx.db
        .query("meetings")
        .withIndex("by_organizer", (q) => q.eq("organizer", args.organizer!))
        .collect();
    } else {
      meetings = await ctx.db
        .query("meetings")
        .withIndex("by_meeting_date")
        .collect();
    }

    const skip = args.skip || 0;
    const limit = args.limit || 50;
    const paginated = meetings.slice(skip, skip + limit);

    return {
      documents: paginated,
      total: meetings.length,
    };
  },
});

// Get meeting by ID
export const get = query({
  args: { id: v.id("meetings") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create meeting
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    meeting_date: v.string(),
    location: v.optional(v.string()),
    organizer: v.id("users"),
    participants: v.array(v.id("users")),
    status: v.union(
      v.literal("scheduled"),
      v.literal("ongoing"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    meeting_type: v.union(
      v.literal("general"),
      v.literal("committee"),
      v.literal("board"),
      v.literal("other")
    ),
    agenda: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("meetings", args);
  },
});

// Update meeting
export const update = mutation({
  args: {
    id: v.id("meetings"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    meeting_date: v.optional(v.string()),
    location: v.optional(v.string()),
    participants: v.optional(v.array(v.id("users"))),
    status: v.optional(
      v.union(
        v.literal("scheduled"),
        v.literal("ongoing"),
        v.literal("completed"),
        v.literal("cancelled")
      )
    ),
    agenda: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const meeting = await ctx.db.get(id);
    if (!meeting) {
      throw new Error("Meeting not found");
    }
    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

// Delete meeting
export const remove = mutation({
  args: { id: v.id("meetings") },
  handler: async (ctx, args) => {
    const meeting = await ctx.db.get(args.id);
    if (!meeting) {
      throw new Error("Meeting not found");
    }
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

