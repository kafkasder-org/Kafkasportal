/**
 * Error Tracking System
 * Convex mutations and queries for managing application errors
 */

import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { Doc } from './_generated/dataModel';

/**
 * Create a new error record or update existing if duplicate found
 */
export const create = mutation({
  args: {
    error_code: v.string(),
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal('runtime'),
      v.literal('ui_ux'),
      v.literal('design_bug'),
      v.literal('system'),
      v.literal('data'),
      v.literal('security'),
      v.literal('performance'),
      v.literal('integration')
    ),
    severity: v.union(
      v.literal('critical'),
      v.literal('high'),
      v.literal('medium'),
      v.literal('low')
    ),
    stack_trace: v.optional(v.string()),
    error_context: v.optional(v.any()),
    user_id: v.optional(v.id('users')),
    session_id: v.optional(v.string()),
    device_info: v.optional(v.any()),
    url: v.optional(v.string()),
    component: v.optional(v.string()),
    function_name: v.optional(v.string()),
    reporter_id: v.optional(v.id('users')),
    tags: v.optional(v.array(v.string())),
    metadata: v.optional(v.any()),
    fingerprint: v.optional(v.string()),
    sentry_event_id: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    // Check for duplicate error by fingerprint
    if (args.fingerprint) {
      const existing = await ctx.db
        .query('errors')
        .withIndex('by_fingerprint', (q) => q.eq('fingerprint', args.fingerprint))
        .first();

      if (existing) {
        // Update existing error
        await ctx.db.patch(existing._id, {
          occurrence_count: existing.occurrence_count + 1,
          last_seen: now,
        });

        // Record new occurrence
        await ctx.db.insert('error_occurrences', {
          error_id: existing._id,
          timestamp: now,
          user_id: args.user_id,
          session_id: args.session_id,
          url: args.url,
          user_action: args.metadata?.user_action,
          request_id: args.metadata?.request_id,
          ip_address: args.metadata?.ip_address,
          user_agent: args.metadata?.user_agent,
          context_snapshot: args.error_context,
          sentry_event_id: args.sentry_event_id,
          stack_trace: args.stack_trace,
        });

        return existing._id;
      }
    }

    // Create new error record
    const errorId = await ctx.db.insert('errors', {
      error_code: args.error_code,
      title: args.title,
      description: args.description,
      category: args.category,
      severity: args.severity,
      status: 'new',
      stack_trace: args.stack_trace,
      error_context: args.error_context,
      user_id: args.user_id,
      session_id: args.session_id,
      device_info: args.device_info,
      url: args.url,
      component: args.component,
      function_name: args.function_name,
      occurrence_count: 1,
      first_seen: now,
      last_seen: now,
      reporter_id: args.reporter_id,
      tags: args.tags,
      metadata: args.metadata,
      fingerprint: args.fingerprint,
      sentry_event_id: args.sentry_event_id,
    });

    // Record first occurrence
    await ctx.db.insert('error_occurrences', {
      error_id: errorId,
      timestamp: now,
      user_id: args.user_id,
      session_id: args.session_id,
      url: args.url,
      user_action: args.metadata?.user_action,
      request_id: args.metadata?.request_id,
      ip_address: args.metadata?.ip_address,
      user_agent: args.metadata?.user_agent,
      context_snapshot: args.error_context,
      sentry_event_id: args.sentry_event_id,
      stack_trace: args.stack_trace,
    });

    return errorId;
  },
});

/**
 * List errors with filters and pagination
 */
export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal('new'),
        v.literal('assigned'),
        v.literal('in_progress'),
        v.literal('resolved'),
        v.literal('closed'),
        v.literal('reopened')
      )
    ),
    severity: v.optional(
      v.union(v.literal('critical'), v.literal('high'), v.literal('medium'), v.literal('low'))
    ),
    category: v.optional(
      v.union(
        v.literal('runtime'),
        v.literal('ui_ux'),
        v.literal('design_bug'),
        v.literal('system'),
        v.literal('data'),
        v.literal('security'),
        v.literal('performance'),
        v.literal('integration')
      )
    ),
    assigned_to: v.optional(v.id('users')),
    start_date: v.optional(v.string()),
    end_date: v.optional(v.string()),
    limit: v.optional(v.number()),
    skip: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let errors;

    // Apply index-based filters
    if (args.status && args.severity) {
      errors = await ctx.db
        .query('errors')
        .withIndex('by_status_severity', (q) =>
          q.eq('status', args.status!).eq('severity', args.severity!)
        )
        .collect();
    } else if (args.status) {
      errors = await ctx.db
        .query('errors')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .collect();
    } else if (args.severity) {
      errors = await ctx.db
        .query('errors')
        .withIndex('by_severity', (q) => q.eq('severity', args.severity!))
        .collect();
    } else if (args.category) {
      errors = await ctx.db
        .query('errors')
        .withIndex('by_category', (q) => q.eq('category', args.category!))
        .collect();
    } else if (args.assigned_to) {
      errors = await ctx.db
        .query('errors')
        .withIndex('by_assigned_to', (q) => q.eq('assigned_to', args.assigned_to!))
        .collect();
    } else {
      errors = await ctx.db.query('errors').withIndex('by_last_seen').order('desc').collect();
    }

    // Additional filtering
    if (args.start_date || args.end_date) {
      errors = errors.filter((error) => {
        if (args.start_date && error.first_seen < args.start_date) return false;
        if (args.end_date && error.last_seen > args.end_date) return false;
        return true;
      });
    }

    // Sort by last_seen descending
    errors.sort((a, b) => new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime());

    // Pagination
    const skip = args.skip || 0;
    const limit = args.limit || 50;
    const paginated = errors.slice(skip, skip + limit);

    return {
      errors: paginated,
      total: errors.length,
      hasMore: skip + limit < errors.length,
    };
  },
});

/**
 * Get error by ID with full details
 */
export const get = query({
  args: { id: v.id('errors') },
  handler: async (ctx, args) => {
    const error = await ctx.db.get(args.id);
    if (!error) return null;

    // Get assigned user details
    let assignedUser: Doc<'users'> | null = null;
    if (error.assigned_to) {
      assignedUser = await ctx.db.get(error.assigned_to);
    }

    // Get reporter details
    let reporter: Doc<'users'> | null = null;
    if (error.reporter_id) {
      reporter = await ctx.db.get(error.reporter_id);
    }

    // Get resolved by user details
    let resolvedByUser: Doc<'users'> | null = null;
    if (error.resolved_by) {
      resolvedByUser = await ctx.db.get(error.resolved_by);
    }

    // Get linked task
    let task: Doc<'tasks'> | null = null;
    if (error.task_id) {
      task = await ctx.db.get(error.task_id);
    }

    return {
      ...error,
      assigned_user: assignedUser,
      reporter,
      resolved_by_user: resolvedByUser,
      task,
    };
  },
});

/**
 * Update error details
 */
export const update = mutation({
  args: {
    id: v.id('errors'),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal('new'),
        v.literal('assigned'),
        v.literal('in_progress'),
        v.literal('resolved'),
        v.literal('closed'),
        v.literal('reopened')
      )
    ),
    severity: v.optional(
      v.union(v.literal('critical'), v.literal('high'), v.literal('medium'), v.literal('low'))
    ),
    tags: v.optional(v.array(v.string())),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

/**
 * Assign error to a user
 */
export const assign = mutation({
  args: {
    id: v.id('errors'),
    assigned_to: v.id('users'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      assigned_to: args.assigned_to,
      status: 'assigned',
    });
    return await ctx.db.get(args.id);
  },
});

/**
 * Resolve an error
 */
export const resolve = mutation({
  args: {
    id: v.id('errors'),
    resolved_by: v.id('users'),
    resolution_notes: v.string(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    await ctx.db.patch(args.id, {
      status: 'resolved',
      resolved_by: args.resolved_by,
      resolved_at: now,
      resolution_notes: args.resolution_notes,
    });
    return await ctx.db.get(args.id);
  },
});

/**
 * Reopen a resolved error
 */
export const reopen = mutation({
  args: {
    id: v.id('errors'),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const error = await ctx.db.get(args.id);
    if (!error) {
      throw new Error('Error not found');
    }

    await ctx.db.patch(args.id, {
      status: 'reopened',
      metadata: {
        ...error.metadata,
        reopen_reason: args.reason,
        reopened_at: new Date().toISOString(),
      },
    });

    return await ctx.db.get(args.id);
  },
});

/**
 * Close an error permanently
 */
export const close = mutation({
  args: {
    id: v.id('errors'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: 'closed',
    });
    return await ctx.db.get(args.id);
  },
});

/**
 * Link error to a task
 */
export const linkTask = mutation({
  args: {
    id: v.id('errors'),
    task_id: v.id('tasks'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      task_id: args.task_id,
    });
    return await ctx.db.get(args.id);
  },
});

/**
 * Get error occurrences timeline
 */
export const getOccurrences = query({
  args: {
    error_id: v.id('errors'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const occurrences = await ctx.db
      .query('error_occurrences')
      .withIndex('by_error', (q) => q.eq('error_id', args.error_id))
      .order('desc')
      .take(args.limit || 100);

    return occurrences;
  },
});

/**
 * Get error statistics
 */
export const getStats = query({
  args: {
    start_date: v.optional(v.string()),
    end_date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let errors = await ctx.db.query('errors').collect();

    // Filter by date range
    if (args.start_date || args.end_date) {
      errors = errors.filter((error) => {
        if (args.start_date && error.first_seen < args.start_date) return false;
        if (args.end_date && error.last_seen > args.end_date) return false;
        return true;
      });
    }

    // Count by status
    const byStatus = errors.reduce(
      (acc, error) => {
        acc[error.status] = (acc[error.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Count by severity
    const bySeverity = errors.reduce(
      (acc, error) => {
        acc[error.severity] = (acc[error.severity] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Count by category
    const byCategory = errors.reduce(
      (acc, error) => {
        acc[error.category] = (acc[error.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Total occurrences
    const totalOccurrences = errors.reduce((sum, error) => sum + error.occurrence_count, 0);

    // Active errors (not closed)
    const activeErrors = errors.filter((e) => e.status !== 'closed').length;

    // Critical/High priority errors
    const criticalErrors = errors.filter(
      (e) => (e.severity === 'critical' || e.severity === 'high') && e.status !== 'closed'
    ).length;

    return {
      total: errors.length,
      activeErrors,
      criticalErrors,
      totalOccurrences,
      byStatus,
      bySeverity,
      byCategory,
    };
  },
});

/**
 * Get error trends over time
 */
export const getTrends = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const errors = await ctx.db.query('errors').collect();

    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Group errors by day
    const dailyCounts: Record<string, number> = {};
    const dailyBySeverity: Record<string, Record<string, number>> = {};

    errors.forEach((error) => {
      const errorDate = new Date(error.first_seen);
      if (errorDate >= startDate) {
        const dateKey = errorDate.toISOString().split('T')[0];
        dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1;

        if (!dailyBySeverity[dateKey]) {
          dailyBySeverity[dateKey] = {};
        }
        dailyBySeverity[dateKey][error.severity] =
          (dailyBySeverity[dateKey][error.severity] || 0) + 1;
      }
    });

    return {
      dailyCounts,
      dailyBySeverity,
    };
  },
});

/**
 * Search errors by title, error code, or component
 */
export const search = query({
  args: {
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query('errors')
      .withSearchIndex('by_search', (q) => q.search('title', args.searchTerm))
      .take(50);

    return results;
  },
});

/**
 * Delete error record (soft delete by closing)
 */
export const remove = mutation({
  args: {
    id: v.id('errors'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: 'closed',
      metadata: {
        deleted_at: new Date().toISOString(),
      },
    });
    return { success: true };
  },
});
