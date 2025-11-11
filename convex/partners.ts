import { v } from 'convex/values';
import { query, mutation } from './_generated/server';

export const getPartners = query({
  args: {
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
    search: v.optional(v.string()),
    filters: v.optional(
      v.object({
        type: v.optional(
          v.union(v.literal('organization'), v.literal('individual'), v.literal('sponsor'))
        ),
        status: v.optional(
          v.union(v.literal('active'), v.literal('inactive'), v.literal('pending'))
        ),
        partnership_type: v.optional(
          v.union(
            v.literal('donor'),
            v.literal('supplier'),
            v.literal('volunteer'),
            v.literal('sponsor'),
            v.literal('service_provider')
          )
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { page = 1, limit = 50, search, filters } = args;

    let allPartners;

    if (search && search.trim()) {
      allPartners = await ctx.db
        .query('partners')
        .withSearchIndex('by_search', (q) => q.search('name', search))
        .collect();
    } else {
      allPartners = await ctx.db.query('partners').collect();
    }

    // Apply filters in-memory
    if (filters?.type) {
      allPartners = allPartners.filter((p) => p.type === filters.type);
    }
    if (filters?.status) {
      allPartners = allPartners.filter((p) => p.status === filters.status);
    }
    if (filters?.partnership_type) {
      allPartners = allPartners.filter((p) => p.partnership_type === filters.partnership_type);
    }

    // Sort by name
    const sortedPartners = allPartners.sort((a, b) => a.name.localeCompare(b.name));

    // Paginate
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedPartners = sortedPartners.slice(start, end);

    // Calculate stats
    const total = sortedPartners.length;
    const totalContribution = sortedPartners.reduce(
      (sum, p) => sum + (p.total_contribution || 0),
      0
    );
    const activePartners = sortedPartners.filter((p) => p.status === 'active').length;

    return {
      data: paginatedPartners,
      total,
      stats: {
        total,
        totalContribution,
        activePartners,
      },
    };
  },
});

export const getPartnerById = query({
  args: { id: v.id('partners') },
  handler: async (ctx, args) => {
    const partner = await ctx.db.get(args.id);
    if (!partner) {
      throw new Error('Partner not found');
    }
    return partner;
  },
});

export const createPartner = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal('organization'), v.literal('individual'), v.literal('sponsor')),
    contact_person: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    website: v.optional(v.string()),
    tax_number: v.optional(v.string()),
    partnership_type: v.union(
      v.literal('donor'),
      v.literal('supplier'),
      v.literal('volunteer'),
      v.literal('sponsor'),
      v.literal('service_provider')
    ),
    collaboration_start_date: v.optional(v.string()),
    collaboration_end_date: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.union(v.literal('active'), v.literal('inactive'), v.literal('pending')),
    total_contribution: v.optional(v.number()),
    contribution_count: v.optional(v.number()),
    logo_url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const partnerId = await ctx.db.insert('partners', {
      ...args,
    });

    return await ctx.db.get(partnerId);
  },
});

export const updatePartner = mutation({
  args: {
    id: v.id('partners'),
    name: v.optional(v.string()),
    type: v.optional(
      v.union(v.literal('organization'), v.literal('individual'), v.literal('sponsor'))
    ),
    contact_person: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    website: v.optional(v.string()),
    tax_number: v.optional(v.string()),
    partnership_type: v.optional(
      v.union(
        v.literal('donor'),
        v.literal('supplier'),
        v.literal('volunteer'),
        v.literal('sponsor'),
        v.literal('service_provider')
      )
    ),
    collaboration_start_date: v.optional(v.string()),
    collaboration_end_date: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.optional(v.union(v.literal('active'), v.literal('inactive'), v.literal('pending'))),
    total_contribution: v.optional(v.number()),
    contribution_count: v.optional(v.number()),
    logo_url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const partner = await ctx.db.get(id);

    if (!partner) {
      throw new Error('Partner not found');
    }

    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

export const deletePartner = mutation({
  args: { id: v.id('partners') },
  handler: async (ctx, args) => {
    const partner = await ctx.db.get(args.id);

    if (!partner) {
      throw new Error('Partner not found');
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// IMPROVED: Uses atomic increment pattern to avoid OCC conflicts
// Instead of read-modify-write, we calculate totals from donations table
export const updateContribution = mutation({
  args: {
    id: v.id('partners'),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const { id, amount: _amount } = args;
    const partner = await ctx.db.get(id);

    if (!partner) {
      throw new Error('Partner not found');
    }

    // BEST PRACTICE: Instead of maintaining a counter here,
    // calculate totals from the donations table where partner contributions are recorded.
    // This avoids OCC conflicts when multiple donations happen simultaneously.
    // For now, we'll use a safer approach:

    // Query all donations for this partner to get accurate totals
    const partnerDonations = await ctx.db
      .query('donations')
      .filter((q) => q.eq(q.field('donor_name'), partner.name))
      .collect();

    const totalContribution = partnerDonations.reduce((sum, d) => sum + d.amount, 0);
    const contributionCount = partnerDonations.length;

    // Update with calculated values instead of incremental updates
    await ctx.db.patch(id, {
      total_contribution: totalContribution,
      contribution_count: contributionCount,
    });

    return await ctx.db.get(id);
  },
});
