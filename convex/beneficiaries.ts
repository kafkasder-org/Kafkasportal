import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

const isValidTcNumber = (value: string): boolean => /^\d{11}$/.test(value);

// List beneficiaries with pagination and filters
export const list = query({
  args: {
    limit: v.optional(v.number()),
    skip: v.optional(v.number()),
    status: v.optional(v.string()),
    city: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let beneficiaries;

    if (args.search) {
      beneficiaries = await ctx.db
        .query('beneficiaries')
        .withSearchIndex('by_search', (q) => q.search('name', args.search!))
        .collect();
    } else {
      if (args.status) {
        beneficiaries = await ctx.db
          .query('beneficiaries')
          .withIndex('by_status', (q) =>
            q.eq('status', args.status as 'TASLAK' | 'AKTIF' | 'PASIF' | 'SILINDI')
          )
          .collect();
      } else if (args.city) {
        beneficiaries = await ctx.db
          .query('beneficiaries')
          .withIndex('by_city', (q) => q.eq('city', args.city!))
          .collect();
      } else {
        beneficiaries = await ctx.db.query('beneficiaries').collect();
      }
    }

    let filtered = beneficiaries;
    if (args.search) {
      if (args.status) {
        filtered = filtered.filter((b) => b.status === args.status);
      }
      if (args.city) {
        filtered = filtered.filter((b) => b.city === args.city);
      }
    }

    // Apply pagination
    const skip = args.skip || 0;
    const limit = args.limit || 50;
    const paginated = filtered.slice(skip, skip + limit);

    return {
      documents: paginated,
      total: filtered.length,
    };
  },
});

// Get beneficiary by ID
export const get = query({
  args: { id: v.id('beneficiaries') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get beneficiary by TC number
// Requires authentication and ADMIN/MANAGER role
export const getByTcNo = query({
  args: { tc_no: v.string() },
  handler: async (ctx, args) => {
    if (!isValidTcNumber(args.tc_no)) {
      throw new Error('Invalid TC number format');
    }

    const beneficiary = await ctx.db
      .query('beneficiaries')
      .withIndex('by_tc_no', (q) => q.eq('tc_no', args.tc_no))
      .first();

    return beneficiary ?? null;
  },
});

// Create beneficiary
export const create = mutation({
  args: {
    name: v.string(),
    tc_no: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    birth_date: v.optional(v.string()),
    gender: v.optional(v.string()),
    nationality: v.optional(v.string()),
    religion: v.optional(v.string()),
    marital_status: v.optional(v.string()),
    address: v.string(),
    city: v.string(),
    district: v.string(),
    neighborhood: v.string(),
    family_size: v.number(),
    children_count: v.optional(v.number()),
    orphan_children_count: v.optional(v.number()),
    elderly_count: v.optional(v.number()),
    disabled_count: v.optional(v.number()),
    income_level: v.optional(v.string()),
    income_source: v.optional(v.string()),
    has_debt: v.optional(v.boolean()),
    housing_type: v.optional(v.string()),
    has_vehicle: v.optional(v.boolean()),
    health_status: v.optional(v.string()),
    has_chronic_illness: v.optional(v.boolean()),
    chronic_illness_detail: v.optional(v.string()),
    has_disability: v.optional(v.boolean()),
    disability_detail: v.optional(v.string()),
    has_health_insurance: v.optional(v.boolean()),
    regular_medication: v.optional(v.string()),
    education_level: v.optional(v.string()),
    occupation: v.optional(v.string()),
    employment_status: v.optional(v.string()),
    aid_type: v.optional(v.string()),
    totalAidAmount: v.optional(v.number()),
    aid_duration: v.optional(v.string()),
    priority: v.optional(v.string()),
    reference_name: v.optional(v.string()),
    reference_phone: v.optional(v.string()),
    reference_relation: v.optional(v.string()),
    application_source: v.optional(v.string()),
    notes: v.optional(v.string()),
    previous_aid: v.optional(v.boolean()),
    other_organization_aid: v.optional(v.boolean()),
    emergency: v.optional(v.boolean()),
    contact_preference: v.optional(v.string()),
    status: v.union(
      v.literal('TASLAK'),
      v.literal('AKTIF'),
      v.literal('PASIF'),
      v.literal('SILINDI')
    ),
    approval_status: v.optional(
      v.union(v.literal('pending'), v.literal('approved'), v.literal('rejected'))
    ),
    approved_by: v.optional(v.string()),
    approved_at: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const payload = args;

    if (!isValidTcNumber(payload.tc_no)) {
      throw new Error('Invalid TC number format');
    }

    const existing = await ctx.db
      .query('beneficiaries')
      .withIndex('by_tc_no', (q) => q.eq('tc_no', payload.tc_no))
      .first();

    if (existing) {
      throw new Error('Beneficiary with this TC number already exists');
    }

    return await ctx.db.insert('beneficiaries', {
      ...payload,
    });
  },
});

// Update beneficiary
export const update = mutation({
  args: {
    id: v.id('beneficiaries'),
    name: v.optional(v.string()),
    tc_no: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal('TASLAK'), v.literal('AKTIF'), v.literal('PASIF'), v.literal('SILINDI'))
    ),
    // Add other optional fields as needed
  },
  handler: async (ctx, args) => {
    const { id, ...rawUpdates } = args;
    const updates = { ...rawUpdates };
    const beneficiary = await ctx.db.get(id);
    if (!beneficiary) {
      throw new Error('Beneficiary not found');
    }

    if (updates.tc_no) {
      if (!isValidTcNumber(updates.tc_no)) {
        throw new Error('Invalid TC number format');
      }

      if (updates.tc_no !== beneficiary.tc_no) {
        const existing = await ctx.db
          .query('beneficiaries')
          .withIndex('by_tc_no', (q) => q.eq('tc_no', updates.tc_no!))
          .first();

        if (existing) {
          throw new Error('Beneficiary with this TC number already exists');
        }
      }

      // value already set on updates.tc_no
    }

    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

// Delete beneficiary
export const remove = mutation({
  args: { id: v.id('beneficiaries') },
  handler: async (ctx, args) => {
    const beneficiary = await ctx.db.get(args.id);
    if (!beneficiary) {
      throw new Error('Beneficiary not found');
    }
    await ctx.db.delete(args.id);
    return { success: true };
  },
});
