/**
 * Communication Logs
 * Tracks email and SMS communications
 */

import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

/**
 * Create a communication log entry
 */
export const create = mutation({
  args: {
    type: v.union(v.literal('email'), v.literal('sms')),
    to: v.string(),
    subject: v.optional(v.string()),
    message: v.string(),
    status: v.union(v.literal('sent'), v.literal('failed'), v.literal('pending')),
    messageId: v.optional(v.string()),
    error: v.optional(v.string()),
    sentAt: v.string(),
    userId: v.optional(v.id('users')),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('communication_logs', args);
  },
});

/**
 * List communication logs with optional filters
 */
export const list = query({
  args: {
    type: v.optional(v.union(v.literal('email'), v.literal('sms'))),
    status: v.optional(v.union(v.literal('sent'), v.literal('failed'), v.literal('pending'))),
    userId: v.optional(v.id('users')),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let logs;

    // Apply filters
    if (args.type) {
      logs = await ctx.db
        .query('communication_logs')
        .withIndex('by_type', (q) => q.eq('type', args.type!))
        .order('desc')
        .take(args.limit || 100);
    } else {
      logs = await ctx.db
        .query('communication_logs')
        .order('desc')
        .take(args.limit || 100);
    }

    // Additional filtering
    let filteredLogs = logs;
    if (args.status) {
      filteredLogs = logs.filter((log) => log.status === args.status);
    }
    if (args.userId) {
      filteredLogs = filteredLogs.filter((log) => log.userId === args.userId);
    }

    return filteredLogs;
  },
});

/**
 * Get communication statistics
 */
export const getStats = query({
  args: {
    type: v.union(v.literal('email'), v.literal('sms')),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query('communication_logs')
      .withIndex('by_type', (q) => q.eq('type', args.type))
      .collect();

    // Filter by date range
    const filteredLogs = logs.filter(
      (log) => log.sentAt >= args.startDate && log.sentAt <= args.endDate
    );

    return {
      total: filteredLogs.length,
      sent: filteredLogs.filter((l) => l.status === 'sent').length,
      failed: filteredLogs.filter((l) => l.status === 'failed').length,
      pending: filteredLogs.filter((l) => l.status === 'pending').length,
    };
  },
});
