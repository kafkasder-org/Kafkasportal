import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List donations with filters
export const list = query({
  args: {
    limit: v.optional(v.number()),
    skip: v.optional(v.number()),
    status: v.optional(v.string()),
    donor_email: v.optional(v.string()),
    is_kumbara: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let donations;
    
    // Filter by is_kumbara first if provided
    if (args.is_kumbara !== undefined) {
      donations = await ctx.db
        .query("donations")
        .withIndex("by_is_kumbara", (q) => q.eq("is_kumbara", args.is_kumbara))
        .collect();
      
      // Apply additional filters on already filtered results
      if (args.status) {
        donations = donations.filter((d) => d.status === args.status);
      }
      if (args.donor_email) {
        donations = donations.filter((d) => d.donor_email === args.donor_email);
      }
    } else if (args.status) {
      donations = await ctx.db
        .query("donations")
        .withIndex("by_status", (q) => q.eq("status", args.status as "pending" | "completed" | "cancelled"))
        .collect();
    } else if (args.donor_email) {
      donations = await ctx.db
        .query("donations")
        .withIndex("by_donor_email", (q) => q.eq("donor_email", args.donor_email!))
        .collect();
    } else {
      donations = await ctx.db.query("donations").collect();
    }

    const skip = args.skip || 0;
    const limit = args.limit || 50;
    const paginated = donations.slice(skip, skip + limit);

    return {
      documents: paginated,
      total: donations.length,
    };
  },
});

// Get donation by ID
export const get = query({
  args: { id: v.id("donations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get donation by receipt number
export const getByReceiptNumber = query({
  args: { receipt_number: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("donations")
      .withIndex("by_receipt_number", (q) =>
        q.eq("receipt_number", args.receipt_number)
      )
      .first();
  },
});

// Create donation
export const create = mutation({
  args: {
    donor_name: v.string(),
    donor_phone: v.string(),
    donor_email: v.optional(v.string()),
    amount: v.number(),
    currency: v.union(v.literal("TRY"), v.literal("USD"), v.literal("EUR")),
    donation_type: v.string(),
    payment_method: v.string(),
    donation_purpose: v.string(),
    notes: v.optional(v.string()),
    receipt_number: v.string(),
    receipt_file_id: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    // Kumbara-specific fields
    is_kumbara: v.optional(v.boolean()),
    kumbara_location: v.optional(v.string()),
    collection_date: v.optional(v.string()),
    kumbara_institution: v.optional(v.string()),
    location_coordinates: v.optional(v.object({ lat: v.number(), lng: v.number() })),
    location_address: v.optional(v.string()),
    route_points: v.optional(v.array(v.object({ lat: v.number(), lng: v.number() }))),
    route_distance: v.optional(v.number()),
    route_duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("donations", args);
  },
});

// Update donation
export const update = mutation({
  args: {
    id: v.id("donations"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("completed"),
        v.literal("cancelled")
      )
    ),
    amount: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const donation = await ctx.db.get(id);
    if (!donation) {
      throw new Error("Donation not found");
    }
    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

// Delete donation
export const remove = mutation({
  args: { id: v.id("donations") },
  handler: async (ctx, args) => {
    const donation = await ctx.db.get(args.id);
    if (!donation) {
      throw new Error("Donation not found");
    }
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

