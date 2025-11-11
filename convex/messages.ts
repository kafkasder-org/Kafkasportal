import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// List messages with filters
export const list = query({
  args: {
    limit: v.optional(v.number()),
    skip: v.optional(v.number()),
    status: v.optional(v.string()),
    sender: v.optional(v.id('users')),
    recipient: v.optional(v.id('users')),
    message_type: v.optional(v.union(v.literal('sms'), v.literal('email'), v.literal('internal'))),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 50, 100);
    const skip = Math.max(args.skip ?? 0, 0);
    const normalizedStatus =
      args.status && ['draft', 'sent', 'failed'].includes(args.status)
        ? (args.status as 'draft' | 'sent' | 'failed')
        : undefined;
    const searchTerm = args.search?.trim().toLowerCase() || '';

    let messages;

    if (searchTerm.length > 0) {
      messages = await ctx.db
        .query('messages')
        .withSearchIndex('by_search', (q) => q.search('subject', searchTerm))
        .collect();
    } else {
      if (args.sender) {
        messages = await ctx.db
          .query('messages')
          .withIndex('by_sender', (q) => q.eq('sender', args.sender!))
          .collect();
      } else if (normalizedStatus) {
        messages = await ctx.db
          .query('messages')
          .withIndex('by_status', (q) => q.eq('status', normalizedStatus))
          .collect();
      } else {
        messages = await ctx.db.query('messages').collect();
      }
    }

    if (searchTerm.length > 0) {
      if (normalizedStatus) {
        messages = messages.filter((message) => message.status === normalizedStatus);
      }
      if (args.sender) {
        messages = messages.filter((message) => message.sender === args.sender);
      }
    }

    if (args.message_type) {
      messages = messages.filter((message) => message.message_type === args.message_type);
    }

    if (args.recipient) {
      messages = messages.filter((message) => message.recipients.includes(args.recipient!));
    }

    const total = messages.length;
    const paginated = messages.slice(skip, skip + limit);

    return {
      documents: paginated,
      total,
    };
  },
});

// Get message by ID
export const get = query({
  args: { id: v.id('messages') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create message
export const create = mutation({
  args: {
    message_type: v.union(v.literal('sms'), v.literal('email'), v.literal('internal')),
    sender: v.id('users'),
    recipients: v.array(v.id('users')),
    subject: v.optional(v.string()),
    content: v.string(),
    status: v.union(v.literal('draft'), v.literal('sent'), v.literal('failed')),
    is_bulk: v.boolean(),
    template_id: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert('messages', {
      ...args,
      sent_at: args.status === 'sent' ? new Date().toISOString() : undefined,
    });
    return messageId;
  },
});

// Update message
export const update = mutation({
  args: {
    id: v.id('messages'),
    subject: v.optional(v.string()),
    content: v.optional(v.string()),
    status: v.optional(v.union(v.literal('draft'), v.literal('sent'), v.literal('failed'))),
    sent_at: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const message = await ctx.db.get(id);
    if (!message) {
      throw new Error('Message not found');
    }

    // Auto-set sent_at when status changes to sent
    if (updates.status === 'sent' && !updates.sent_at) {
      updates.sent_at = new Date().toISOString();
    }

    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

// Delete message
export const remove = mutation({
  args: { id: v.id('messages') },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.id);
    if (!message) {
      throw new Error('Message not found');
    }
    await ctx.db.delete(args.id);
    return { success: true };
  },
});
