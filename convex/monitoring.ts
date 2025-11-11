import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// Health check for all system components
export const healthCheck = query({
  args: {},
  handler: async (ctx) => {
    const checks = {
      database: { status: 'healthy', latency: 0 },
      storage: { status: 'healthy', latency: 0 },
      collections: {} as Record<string, { count: number; status: string }>,
    };

    const startTime = Date.now();

    try {
      // Check database connectivity
      // const users = await ctx.db.query("users").take(1);
      await ctx.db.query('users').take(1);
      checks.database.latency = Date.now() - startTime;
      checks.database.status = 'healthy';

      // Check collection health
      const collections = [
        'users',
        'beneficiaries',
        'donations',
        'finance_records',
        'tasks',
        'meetings',
      ];

      for (const collection of collections) {
        try {
          const count = (await ctx.db.query(collection as never).collect()).length;
          checks.collections[collection] = {
            count,
            status: 'healthy',
          };
        } catch {
          checks.collections[collection] = {
            count: 0,
            status: 'unhealthy',
          };
        }
      }
    } catch {
      checks.database.status = 'unhealthy';
    }

    return {
      status: checks.database.status === 'healthy' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks,
    };
  },
});

// Log performance metrics
export const logPerformanceMetric = mutation({
  args: {
    metricType: v.union(
      v.literal('page_load'),
      v.literal('api_call'),
      v.literal('database_query'),
      v.literal('render_time')
    ),
    metricName: v.string(),
    value: v.number(),
    unit: v.string(),
    // Note: v.any() is required for Convex validators with dynamic metadata
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('performance_metrics', {
      metric_type: args.metricType,
      metric_name: args.metricName,
      value: args.value,
      unit: args.unit,
      metadata: args.metadata,
      recorded_at: new Date().toISOString(),
    });
  },
});

// Get performance metrics
export const getPerformanceMetrics = query({
  args: {
    metricType: v.optional(
      v.union(
        v.literal('page_load'),
        v.literal('api_call'),
        v.literal('database_query'),
        v.literal('render_time')
      )
    ),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;
    let metrics = await ctx.db
      .query('performance_metrics')
      .order('desc')
      .take(limit * 2);

    // Filter by metric type
    if (args.metricType) {
      metrics = metrics.filter((m) => m.metric_type === args.metricType);
    }

    // Filter by date range
    if (args.startDate) {
      const startDate = args.startDate;
      metrics = metrics.filter((m) => m.recorded_at >= startDate);
    }
    if (args.endDate) {
      const endDate = args.endDate;
      metrics = metrics.filter((m) => m.recorded_at <= endDate);
    }

    return metrics.slice(0, limit);
  },
});

// Calculate performance statistics
export const getPerformanceStats = query({
  args: {
    metricName: v.string(),
    hours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const hours = args.hours || 24;
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hours);

    const metrics = await ctx.db
      .query('performance_metrics')
      .filter((q) =>
        q.and(
          q.eq(q.field('metric_name'), args.metricName),
          q.gte(q.field('recorded_at'), cutoffDate.toISOString())
        )
      )
      .collect();

    if (metrics.length === 0) {
      return null;
    }

    const values = metrics.map((m) => m.value);
    const sorted = [...values].sort((a, b) => a - b);

    return {
      count: metrics.length,
      min: Math.min(...values),
      max: Math.max(...values),
      average: values.reduce((sum, v) => sum + v, 0) / values.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    };
  },
});

// Log application errors
export const logError = mutation({
  args: {
    errorType: v.string(),
    errorMessage: v.string(),
    stackTrace: v.optional(v.string()),
    userId: v.optional(v.id('users')),
    // Note: v.any() is required for Convex validators with dynamic context
    context: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('error_logs', {
      error_type: args.errorType,
      error_message: args.errorMessage,
      stack_trace: args.stackTrace,
      user_id: args.userId,
      context: args.context,
      occurred_at: new Date().toISOString(),
      resolved: false,
    });
  },
});

// Get error logs
export const getErrorLogs = query({
  args: {
    resolved: v.optional(v.boolean()),
    errorType: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    let logs = await ctx.db
      .query('error_logs')
      .order('desc')
      .take(limit * 2);

    if (args.resolved !== undefined) {
      logs = logs.filter((log) => log.resolved === args.resolved);
    }

    if (args.errorType) {
      logs = logs.filter((log) => log.error_type === args.errorType);
    }

    return logs.slice(0, limit);
  },
});

// Mark error as resolved
export const markErrorResolved = mutation({
  args: {
    errorId: v.id('error_logs'),
    resolvedBy: v.id('users'),
    resolution: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.errorId, {
      resolved: true,
      resolved_by: args.resolvedBy,
      resolved_at: new Date().toISOString(),
      resolution: args.resolution,
    });
    return { success: true };
  },
});

// System statistics dashboard
export const getSystemStats = query({
  args: {},
  handler: async (ctx) => {
    const [userCount, beneficiaryCount, donationCount, taskCount, meetingCount, recentErrors] =
      await Promise.all([
        ctx.db
          .query('users')
          .collect()
          .then((r) => r.length),
        ctx.db
          .query('beneficiaries')
          .collect()
          .then((r) => r.length),
        ctx.db
          .query('donations')
          .collect()
          .then((r) => r.length),
        ctx.db
          .query('tasks')
          .collect()
          .then((r) => r.length),
        ctx.db
          .query('meetings')
          .collect()
          .then((r) => r.length),
        ctx.db
          .query('error_logs')
          .filter((q) => q.eq(q.field('resolved'), false))
          .collect()
          .then((r) => r.length),
      ]);

    return {
      collections: {
        users: userCount,
        beneficiaries: beneficiaryCount,
        donations: donationCount,
        tasks: taskCount,
        meetings: meetingCount,
      },
      alerts: {
        unresolvedErrors: recentErrors,
      },
      timestamp: new Date().toISOString(),
    };
  },
});

// Alert management
export const createAlert = mutation({
  args: {
    alertType: v.union(
      v.literal('error'),
      v.literal('performance'),
      v.literal('security'),
      v.literal('system')
    ),
    severity: v.union(
      v.literal('low'),
      v.literal('medium'),
      v.literal('high'),
      v.literal('critical')
    ),
    title: v.string(),
    description: v.string(),

    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('system_alerts', {
      alert_type: args.alertType,
      severity: args.severity,
      title: args.title,
      description: args.description,
      metadata: args.metadata,
      created_at: new Date().toISOString(),
      acknowledged: false,
      resolved: false,
    });
  },
});

// Get active alerts
export const getActiveAlerts = query({
  args: {
    severity: v.optional(
      v.union(v.literal('low'), v.literal('medium'), v.literal('high'), v.literal('critical'))
    ),
  },
  handler: async (ctx, args) => {
    let alerts = await ctx.db
      .query('system_alerts')
      .filter((q) => q.eq(q.field('resolved'), false))
      .order('desc')
      .take(50);

    if (args.severity) {
      alerts = alerts.filter((a) => a.severity === args.severity);
    }

    return alerts;
  },
});

// Acknowledge alert
export const acknowledgeAlert = mutation({
  args: {
    alertId: v.id('system_alerts'),
    acknowledgedBy: v.id('users'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.alertId, {
      acknowledged: true,
      acknowledged_by: args.acknowledgedBy,
      acknowledged_at: new Date().toISOString(),
    });
    return { success: true };
  },
});
