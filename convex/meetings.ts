import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// List meetings with filters
export const list = query({
  args: {
    limit: v.optional(v.number()),
    skip: v.optional(v.number()),
    status: v.optional(v.string()),
    organizer: v.optional(v.id('users')),
  },
  returns: v.object({
    documents: v.array(v.any()),
    total: v.number(),
  }),
  handler: async (ctx, args) => {
    let meetings;

    if (args.status) {
      meetings = await ctx.db
        .query('meetings')
        .withIndex('by_status', (q) =>
          q.eq('status', args.status as 'scheduled' | 'ongoing' | 'completed' | 'cancelled')
        )
        .collect();
    } else if (args.organizer) {
      meetings = await ctx.db
        .query('meetings')
        .withIndex('by_organizer', (q) => q.eq('organizer', args.organizer!))
        .collect();
    } else {
      meetings = await ctx.db.query('meetings').withIndex('by_meeting_date').collect();
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
  args: { id: v.id('meetings') },
  returns: v.union(v.null(), v.any()),
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
    organizer: v.id('users'),
    participants: v.array(v.id('users')),
    status: v.union(
      v.literal('scheduled'),
      v.literal('ongoing'),
      v.literal('completed'),
      v.literal('cancelled')
    ),
    meeting_type: v.union(
      v.literal('general'),
      v.literal('committee'),
      v.literal('board'),
      v.literal('other')
    ),
    agenda: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  returns: v.id('meetings'),
  handler: async (ctx, args) => {
    return await ctx.db.insert('meetings', args);
  },
});

// Update meeting
export const update = mutation({
  args: {
    id: v.id('meetings'),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    meeting_date: v.optional(v.string()),
    location: v.optional(v.string()),
    participants: v.optional(v.array(v.id('users'))),
    status: v.optional(
      v.union(
        v.literal('scheduled'),
        v.literal('ongoing'),
        v.literal('completed'),
        v.literal('cancelled')
      )
    ),
    agenda: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  returns: v.union(v.null(), v.any()),
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const meeting = await ctx.db.get(id);
    if (!meeting) {
      throw new Error('Meeting not found');
    }
    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

// Delete meeting
export const remove = mutation({
  args: { id: v.id('meetings') },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const meeting = await ctx.db.get(args.id);
    if (!meeting) {
      throw new Error('Meeting not found');
    }
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// Get categorized meetings for a user
export const getCategorizedMeetings = query({
  args: {
    userId: v.id('users'),
  },
  returns: v.object({
    invitations: v.array(v.any()),
    participating: v.array(v.any()),
    informed: v.array(v.any()),
    open: v.array(v.any()),
  }),
  handler: async (ctx, args) => {
    const allMeetings = await ctx.db.query('meetings').withIndex('by_meeting_date').collect();

    const now = new Date();
    const userMeetings = allMeetings.filter(
      (m) => m.participants?.includes(args.userId) || m.organizer === args.userId
    );

    // Categorize meetings
    const categorized = {
      invitations: [] as typeof allMeetings,
      participating: [] as typeof allMeetings,
      informed: [] as typeof allMeetings,
      open: [] as typeof allMeetings,
    };

    for (const meeting of userMeetings) {
      const meetingDate = new Date(meeting.meeting_date);
      const isPast = meetingDate < now;

      // Skip past meetings
      if (isPast) continue;

      // Categorization logic
      if (meeting.status === 'scheduled') {
        // Scheduled meeting - could be invitation or participation
        categorized.participating.push(meeting);
      } else if (meeting.meeting_type === 'general') {
        // General info meeting
        categorized.informed.push(meeting);
      }
    }

    // Open meetings (public, anyone can join)
    const openMeetings = allMeetings.filter(
      (m) =>
        m.meeting_type === 'general' && m.status === 'scheduled' && new Date(m.meeting_date) >= now
    );
    categorized.open = openMeetings;

    return categorized;
  },
});

// Accept meeting invitation
export const acceptInvitation = mutation({
  args: {
    meetingId: v.id('meetings'),
    userId: v.id('users'),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const meeting = await ctx.db.get(args.meetingId);
    if (!meeting) {
      throw new Error('Meeting not found');
    }

    // Meeting acceptance - status remains scheduled
    // Note: response_status field does not exist in schema

    return { success: true };
  },
});

// Decline meeting invitation
export const declineInvitation = mutation({
  args: {
    meetingId: v.id('meetings'),
    userId: v.id('users'),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const meeting = await ctx.db.get(args.meetingId);
    if (!meeting) {
      throw new Error('Meeting not found');
    }

    // Meeting decline - cancel the meeting
    await ctx.db.patch(args.meetingId, {
      status: 'cancelled',
    });

    return { success: true };
  },
});
