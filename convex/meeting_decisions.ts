import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const decisionStatus = v.union(
  v.literal("acik"),
  v.literal("devam"),
  v.literal("kapatildi")
);

export const list = query({
  args: {
    meeting_id: v.optional(v.id("meetings")),
    owner: v.optional(v.id("users")),
    status: v.optional(decisionStatus),
  },
  handler: async (ctx, args) => {
    const { meeting_id, owner, status } = args;

    if (meeting_id) {
      return await ctx.db
        .query("meeting_decisions")
        .withIndex("by_meeting", (q) => q.eq("meeting_id", meeting_id))
        .collect();
    }

    if (owner) {
      return await ctx.db
        .query("meeting_decisions")
        .withIndex("by_owner", (q) => q.eq("owner", owner))
        .collect();
    }

    if (status) {
      return await ctx.db
        .query("meeting_decisions")
        .withIndex("by_status", (q) => q.eq("status", status))
        .collect();
    }

    return await ctx.db.query("meeting_decisions").collect();
  },
});

export const get = query({
  args: { id: v.id("meeting_decisions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    meeting_id: v.id("meetings"),
    title: v.string(),
    summary: v.optional(v.string()),
    owner: v.optional(v.id("users")),
    created_by: v.id("users"),
    status: v.optional(decisionStatus),
    tags: v.optional(v.array(v.string())),
    due_date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const created_at = new Date().toISOString();

    return await ctx.db.insert("meeting_decisions", {
      meeting_id: args.meeting_id,
      title: args.title,
      summary: args.summary,
      owner: args.owner,
      created_by: args.created_by,
      created_at,
      status: args.status ?? "acik",
      tags: args.tags,
      due_date: args.due_date,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("meeting_decisions"),
    title: v.optional(v.string()),
    summary: v.optional(v.string()),
    owner: v.optional(v.id("users")),
    status: v.optional(decisionStatus),
    tags: v.optional(v.array(v.string())),
    due_date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const decision = await ctx.db.get(id);

    if (!decision) {
      throw new Error("Decision not found");
    }

    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("meeting_decisions") },
  handler: async (ctx, args) => {
    const decision = await ctx.db.get(args.id);
    if (!decision) {
      throw new Error("Decision not found");
    }
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

