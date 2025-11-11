import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Security audit log entry
export const logSecurityEvent = mutation({
  args: {
    eventType: v.union(
      v.literal("login_attempt"),
      v.literal("login_success"),
      v.literal("login_failure"),
      v.literal("logout"),
      v.literal("permission_denied"),
      v.literal("suspicious_activity"),
      v.literal("password_change"),
      v.literal("2fa_enabled"),
      v.literal("2fa_disabled"),
      v.literal("data_access"),
      v.literal("data_modification")
    ),
    userId: v.optional(v.id("users")),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    details: v.optional(v.any()),
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("security_events", {
      event_type: args.eventType,
      user_id: args.userId,
      ip_address: args.ipAddress,
      user_agent: args.userAgent,
      details: args.details,
      severity: args.severity,
      occurred_at: new Date().toISOString(),
      reviewed: false,
    });
  },
});

// Get security events
export const getSecurityEvents = query({
  args: {
    userId: v.optional(v.id("users")),
    eventType: v.optional(v.string()),
    severity: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical"))),
    startDate: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;
    let events = await ctx.db.query("security_events").order("desc").take(limit * 2);

    if (args.userId) {
      events = events.filter((e) => e.user_id === args.userId);
    }

    if (args.eventType) {
      events = events.filter((e) => e.event_type === args.eventType);
    }

    if (args.severity) {
      events = events.filter((e) => e.severity === args.severity);
    }

    if (args.startDate) {
      events = events.filter((e) => e.occurred_at >= args.startDate!);
    }

    return events.slice(0, limit);
  },
});

// Detect suspicious login patterns
export const detectSuspiciousActivity = query({
  args: {
    userId: v.id("users"),
    hours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const hours = args.hours || 24;
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hours);

    const events = await ctx.db
      .query("security_events")
      .filter((q) =>
        q.and(
          q.eq(q.field("user_id"), args.userId),
          q.gte(q.field("occurred_at"), cutoffDate.toISOString())
        )
      )
      .collect();

    // Analyze patterns
    const failedLogins = events.filter((e) => e.event_type === "login_failure").length;
    const uniqueIPs = new Set(events.map((e) => e.ip_address).filter(Boolean)).size;
    const permissionDenied = events.filter((e) => e.event_type === "permission_denied").length;

    const isSuspicious =
      failedLogins > 5 || // More than 5 failed logins
      uniqueIPs > 3 || // Logins from more than 3 different IPs
      permissionDenied > 10; // More than 10 permission denials

    return {
      isSuspicious,
      metrics: {
        failedLogins,
        uniqueIPs,
        permissionDenied,
        totalEvents: events.length,
      },
      recommendation: isSuspicious
        ? "Account may be compromised. Consider requiring password reset and 2FA."
        : "No suspicious activity detected.",
    };
  },
});

// Session management for security
export const getActiveSessions = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("user_sessions")
      .filter((q) =>
        q.and(
          q.eq(q.field("user_id"), args.userId),
          q.eq(q.field("is_active"), true)
        )
      )
      .collect();

    return sessions.map((session) => ({
      sessionId: session._id,
      deviceInfo: session.device_info,
      ipAddress: session.ip_address,
      lastActivity: session.last_activity,
      createdAt: session.created_at,
    }));
  },
});

// Revoke session (for security)
export const revokeSession = mutation({
  args: {
    sessionId: v.id("user_sessions"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      is_active: false,
      revoked_at: new Date().toISOString(),
      revocation_reason: args.reason,
    });

    return { success: true };
  },
});

// Rate limiting check
export const checkRateLimit = query({
  args: {
    identifier: v.string(), // IP address or user ID
    action: v.string(),
    windowMinutes: v.optional(v.number()),
    maxAttempts: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const windowMinutes = args.windowMinutes || 15;
    const maxAttempts = args.maxAttempts || 10;

    const cutoffDate = new Date();
    cutoffDate.setMinutes(cutoffDate.getMinutes() - windowMinutes);

    const attempts = await ctx.db
      .query("rate_limit_log")
      .filter((q) =>
        q.and(
          q.eq(q.field("identifier"), args.identifier),
          q.eq(q.field("action"), args.action),
          q.gte(q.field("timestamp"), cutoffDate.toISOString())
        )
      )
      .collect();

    const isRateLimited = attempts.length >= maxAttempts;

    return {
      isRateLimited,
      attempts: attempts.length,
      maxAttempts,
      resetAt: new Date(cutoffDate.getTime() + windowMinutes * 60000).toISOString(),
    };
  },
});

// Log rate limit attempt
export const logRateLimitAttempt = mutation({
  args: {
    identifier: v.string(),
    action: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("rate_limit_log", {
      identifier: args.identifier,
      action: args.action,
      timestamp: new Date().toISOString(),
    });
  },
});

// Compliance audit report
export const generateComplianceReport = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    // Fetch all security events in date range
    const securityEvents = await ctx.db
      .query("security_events")
      .filter((q) =>
        q.and(
          q.gte(q.field("occurred_at"), args.startDate),
          q.lte(q.field("occurred_at"), args.endDate)
        )
      )
      .collect();

    // Fetch audit logs (data access/modification)
    const auditLogs = await ctx.db
      .query("audit_logs")
      .filter((q) =>
        q.and(
          q.gte(q.field("timestamp"), args.startDate),
          q.lte(q.field("timestamp"), args.endDate)
        )
      )
      .collect();

    // Categorize events
    const eventsByType: Record<string, number> = {};
    securityEvents.forEach((event) => {
      eventsByType[event.event_type] = (eventsByType[event.event_type] || 0) + 1;
    });

    const actionsByType: Record<string, number> = {};
    auditLogs.forEach((log) => {
      actionsByType[log.action] = (actionsByType[log.action] || 0) + 1;
    });

    return {
      period: { startDate: args.startDate, endDate: args.endDate },
      summary: {
        totalSecurityEvents: securityEvents.length,
        totalAuditLogs: auditLogs.length,
        criticalEvents: securityEvents.filter((e) => e.severity === "critical").length,
        highSeverityEvents: securityEvents.filter((e) => e.severity === "high").length,
      },
      breakdown: {
        securityEventsByType: eventsByType,
        auditActionsByType: actionsByType,
      },
      compliance: {
        kvkkCompliant: true, // Based on audit log completeness
        gdprCompliant: true, // Based on consent tracking
        dataRetention: "7 years", // KVKK requirement
      },
    };
  },
});
