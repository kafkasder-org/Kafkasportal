/**
 * Analytics Events
 * Track user interactions and system events
 */

import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

/**
 * Track an analytics event
 */
export const track = mutation({
  args: {
    event: v.string(),
    properties: v.any(),
    userId: v.optional(v.id('users')),
    sessionId: v.optional(v.string()),
    timestamp: v.string(),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('analytics_events', args);
  },
});

/**
 * Get event statistics for a specific event
 */
export const getEventStats = query({
  args: {
    event: v.string(),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query('analytics_events')
      .withIndex('by_event', (q) => q.eq('event', args.event))
      .collect();

    // Filter by date range
    const filteredEvents = events.filter(
      (e) => e.timestamp >= args.startDate && e.timestamp <= args.endDate
    );

    const uniqueUsers = new Set(filteredEvents.filter((e) => e.userId).map((e) => e.userId));

    return {
      count: filteredEvents.length,
      uniqueUsers: uniqueUsers.size,
      events: filteredEvents.slice(0, 100), // Return first 100 events
    };
  },
});

/**
 * Get top events by count
 */
export const getTopEvents = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const events = await ctx.db.query('analytics_events').withIndex('by_timestamp').collect();

    // Filter by date range
    const filteredEvents = events.filter(
      (e) => e.timestamp >= args.startDate && e.timestamp <= args.endDate
    );

    // Count events
    const eventCounts = filteredEvents.reduce(
      (acc, event) => {
        acc[event.event] = (acc[event.event] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Sort and limit
    return Object.entries(eventCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, args.limit || 10)
      .map(([event, count]) => ({ event, count }));
  },
});

/**
 * Get user activity
 */
export const getUserActivity = query({
  args: {
    userId: v.id('users'),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query('analytics_events')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();

    // Filter by date range
    const filteredEvents = events.filter(
      (e) => e.timestamp >= args.startDate && e.timestamp <= args.endDate
    );

    return {
      totalEvents: filteredEvents.length,
      events: filteredEvents.slice(0, 100),
    };
  },
});
