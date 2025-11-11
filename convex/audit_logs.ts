/**
 * Audit Logs
 * Track all critical operations for compliance
 */

import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

/**
 * Log an audit action
 */
export const logAction = mutation({
  args: {
    userId: v.id('users'),
    userName: v.string(),
    action: v.union(
      v.literal('CREATE'),
      v.literal('UPDATE'),
      v.literal('DELETE'),
      v.literal('VIEW')
    ),
    resource: v.string(),
    resourceId: v.string(),
    changes: v.optional(v.any()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('audit_logs', {
      ...args,
      timestamp: new Date().toISOString(),
    });
  },
});

/**
 * List audit logs with filters
 */
export const list = query({
  args: {
    resourceId: v.optional(v.string()),
    userId: v.optional(v.id('users')),
    action: v.optional(
      v.union(v.literal('CREATE'), v.literal('UPDATE'), v.literal('DELETE'), v.literal('VIEW'))
    ),
    resource: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let logs;

    // Apply index-based filters
    if (args.userId) {
      logs = await ctx.db
        .query('audit_logs')
        .withIndex('by_user', (q) => q.eq('userId', args.userId!))
        .order('desc')
        .take(args.limit || 100);
    } else if (args.resource && args.resourceId) {
      logs = await ctx.db
        .query('audit_logs')
        .withIndex('by_resource', (q) =>
          q.eq('resource', args.resource!).eq('resourceId', args.resourceId!)
        )
        .order('desc')
        .take(args.limit || 100);
    } else {
      logs = await ctx.db
        .query('audit_logs')
        .order('desc')
        .take(args.limit || 100);
    }

    // Additional filtering
    if (args.startDate || args.endDate) {
      logs = logs.filter((log) => {
        if (args.startDate && log.timestamp < args.startDate) return false;
        if (args.endDate && log.timestamp > args.endDate) return false;
        return true;
      });
    }

    if (args.action) {
      logs = logs.filter((log) => log.action === args.action);
    }

    return logs;
  },
});

/**
 * Get audit statistics
 */
export const getStats = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query('audit_logs')
      .filter((q) =>
        q.and(
          q.gte(q.field('timestamp'), args.startDate),
          q.lte(q.field('timestamp'), args.endDate)
        )
      )
      .collect();

    // Count by action
    const byAction = logs.reduce(
      (acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Count by resource
    const byResource = logs.reduce(
      (acc, log) => {
        acc[log.resource] = (acc[log.resource] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Top users
    const userCounts = logs.reduce(
      (acc, log) => {
        const key = `${log.userId}:${log.userName}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const topUsers = Object.entries(userCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([key, count]) => {
        const [userId, userName] = key.split(':');
        return { userId, userName, count };
      });

    return {
      total: logs.length,
      byAction,
      byResource,
      topUsers,
    };
  },
});

/**
 * Get resource history
 */
export const getResourceHistory = query({
  args: {
    resource: v.string(),
    resourceId: v.string(),
  },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query('audit_logs')
      .withIndex('by_resource', (q) =>
        q.eq('resource', args.resource).eq('resourceId', args.resourceId)
      )
      .order('desc')
      .take(50);

    return logs;
  },
});
