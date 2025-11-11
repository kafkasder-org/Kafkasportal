import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List aid applications with filters
export const list = query({
  args: {
    limit: v.optional(v.number()),
    skip: v.optional(v.number()),
    stage: v.optional(v.string()),
    status: v.optional(v.string()),
    beneficiary_id: v.optional(v.id("beneficiaries")),
  },
  handler: async (ctx, args) => {
    let applications;
    
    if (args.beneficiary_id) {
      applications = await ctx.db
        .query("aid_applications")
        .withIndex("by_beneficiary", (q) => q.eq("beneficiary_id", args.beneficiary_id))
        .collect();
    } else if (args.stage) {
      applications = await ctx.db
        .query("aid_applications")
        .withIndex("by_stage", (q) => q.eq("stage", args.stage as "draft" | "under_review" | "approved" | "ongoing" | "completed"))
        .collect();
    } else if (args.status) {
      applications = await ctx.db
        .query("aid_applications")
        .withIndex("by_status", (q) => q.eq("status", args.status as "open" | "closed"))
        .collect();
    } else {
      applications = await ctx.db.query("aid_applications").collect();
    }

    const skip = args.skip || 0;
    const limit = args.limit || 50;
    const paginated = applications.slice(skip, skip + limit);

    return {
      documents: paginated,
      total: applications.length,
    };
  },
});

// Get aid application by ID
export const get = query({
  args: { id: v.id("aid_applications") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create aid application
export const create = mutation({
  args: {
    application_date: v.string(),
    applicant_type: v.union(
      v.literal("person"),
      v.literal("organization"),
      v.literal("partner")
    ),
    applicant_name: v.string(),
    beneficiary_id: v.optional(v.id("beneficiaries")),
    one_time_aid: v.optional(v.number()),
    regular_financial_aid: v.optional(v.number()),
    regular_food_aid: v.optional(v.number()),
    in_kind_aid: v.optional(v.number()),
    service_referral: v.optional(v.number()),
    stage: v.union(
      v.literal("draft"),
      v.literal("under_review"),
      v.literal("approved"),
      v.literal("ongoing"),
      v.literal("completed")
    ),
    status: v.union(v.literal("open"), v.literal("closed")),
    description: v.optional(v.string()),
    notes: v.optional(v.string()),
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("normal"),
        v.literal("high"),
        v.literal("urgent")
      )
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("aid_applications", args);
  },
});

// Update aid application
export const update = mutation({
  args: {
    id: v.id("aid_applications"),
    stage: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("under_review"),
        v.literal("approved"),
        v.literal("ongoing"),
        v.literal("completed")
      )
    ),
    status: v.optional(v.union(v.literal("open"), v.literal("closed"))),
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("normal"),
        v.literal("high"),
        v.literal("urgent")
      )
    ),
    one_time_aid: v.optional(v.number()),
    regular_financial_aid: v.optional(v.number()),
    regular_food_aid: v.optional(v.number()),
    in_kind_aid: v.optional(v.number()),
    service_referral: v.optional(v.number()),
    description: v.optional(v.string()),
    notes: v.optional(v.string()),
    processed_by: v.optional(v.id("users")),
    processed_at: v.optional(v.string()),
    approved_by: v.optional(v.id("users")),
    approved_at: v.optional(v.string()),
    completed_at: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const application = await ctx.db.get(id);
    if (!application) {
      throw new Error("Aid application not found");
    }

    // Auto-set timestamps based on stage/status changes
    if (updates.stage === "approved" && !updates.approved_at) {
      updates.approved_at = new Date().toISOString();
    }
    if (updates.stage === "completed" && !updates.completed_at) {
      updates.completed_at = new Date().toISOString();
    }

    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

// Delete aid application
export const remove = mutation({
  args: { id: v.id("aid_applications") },
  handler: async (ctx, args) => {
    const application = await ctx.db.get(args.id);
    if (!application) {
      throw new Error("Aid application not found");
    }
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

