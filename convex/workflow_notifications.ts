import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const notificationStatus = v.union(
  v.literal("beklemede"),
  v.literal("gonderildi"),
  v.literal("okundu")
);

const notificationCategory = v.union(
  v.literal("meeting"),
  v.literal("gorev"),
  v.literal("rapor"),
  v.literal("hatirlatma")
);

const notificationReference = v.object({
  type: v.union(
    v.literal("meeting_action_item"),
    v.literal("meeting"),
    v.literal("meeting_decision")
  ),
  id: v.string(),
});

export const list = query({
  args: {
    recipient: v.optional(v.id("users")),
    status: v.optional(notificationStatus),
    category: v.optional(notificationCategory),
  },
  handler: async (ctx, args) => {
    const { recipient, status, category } = args;

    if (recipient) {
      let queryBuilder = ctx.db
        .query("workflow_notifications")
        .withIndex("by_recipient", (q) => q.eq("recipient", recipient));

      if (status) {
        queryBuilder = queryBuilder.filter((q) => q.eq(q.field("status"), status));
      }

      if (category) {
        queryBuilder = queryBuilder.filter((q) => q.eq(q.field("category"), category));
      }

      return await queryBuilder.collect();
    }

    if (status) {
      return await ctx.db
        .query("workflow_notifications")
        .withIndex("by_status", (q) => q.eq("status", status))
        .collect();
    }

    if (category) {
      return await ctx.db
        .query("workflow_notifications")
        .withIndex("by_category", (q) => q.eq("category", category))
        .collect();
    }

    return await ctx.db.query("workflow_notifications").collect();
  },
});

export const get = query({
  args: { id: v.id("workflow_notifications") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    recipient: v.id("users"),
    triggered_by: v.optional(v.id("users")),
    category: notificationCategory,
    title: v.string(),
    body: v.optional(v.string()),
    status: v.optional(notificationStatus),
    reference: v.optional(notificationReference),
    metadata: v.optional(v.any()),
    created_at: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    return await ctx.db.insert("workflow_notifications", {
      recipient: args.recipient,
      triggered_by: args.triggered_by,
      category: args.category,
      title: args.title,
      body: args.body,
      status: args.status ?? "beklemede",
      created_at: args.created_at ?? now,
      sent_at: args.status === "gonderildi" ? now : undefined,
      read_at: args.status === "okundu" ? now : undefined,
      reference: args.reference,
      metadata: args.metadata,
    });
  },
});

export const markAsSent = mutation({
  args: {
    id: v.id("workflow_notifications"),
    sent_at: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.id);
    if (!notification) {
      throw new Error("Notification not found");
    }

    const sent_at = args.sent_at ?? new Date().toISOString();

    await ctx.db.patch(args.id, {
      status: "gonderildi",
      sent_at,
    });

    return await ctx.db.get(args.id);
  },
});

export const markAsRead = mutation({
  args: {
    id: v.id("workflow_notifications"),
    read_at: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.id);
    if (!notification) {
      throw new Error("Notification not found");
    }

    const read_at = args.read_at ?? new Date().toISOString();

    await ctx.db.patch(args.id, {
      status: "okundu",
      read_at,
    });

    return await ctx.db.get(args.id);
  },
});

export const remove = mutation({
  args: { id: v.id("workflow_notifications") },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.id);
    if (!notification) {
      throw new Error("Notification not found");
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// Get unread notification count for a user
export const getUnreadCount = query({
  args: {
    recipient: v.id("users"),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("workflow_notifications")
      .withIndex("by_recipient", (q) => q.eq("recipient", args.recipient))
      .filter((q) => q.neq(q.field("status"), "okundu"))
      .collect();

    return notifications.length;
  },
});

// Mark all notifications as read for a user
export const markAllAsRead = mutation({
  args: {
    recipient: v.id("users"),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("workflow_notifications")
      .withIndex("by_recipient", (q) => q.eq("recipient", args.recipient))
      .filter((q) => q.neq(q.field("status"), "okundu"))
      .collect();

    const now = new Date().toISOString();
    await Promise.all(
      notifications.map((notification) =>
        ctx.db.patch(notification._id, {
          status: "okundu",
          read_at: now,
        })
      )
    );

    return { count: notifications.length };
  },
});

// Get recent notifications for a user (paginated)
export const getRecent = query({
  args: {
    recipient: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const notifications = await ctx.db
      .query("workflow_notifications")
      .withIndex("by_recipient", (q) => q.eq("recipient", args.recipient))
      .order("desc")
      .take(limit);

    return notifications;
  },
});

// Delete old read notifications (cleanup)
export const deleteOldReadNotifications = mutation({
  args: {
    daysOld: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const daysOld = args.daysOld || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    const cutoffISO = cutoffDate.toISOString();

    const oldNotifications = await ctx.db
      .query("workflow_notifications")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "okundu"),
          q.lt(q.field("read_at"), cutoffISO)
        )
      )
      .collect();

    await Promise.all(
      oldNotifications.map((notification) => ctx.db.delete(notification._id))
    );

    return { deletedCount: oldNotifications.length };
  },
});

// Create system notification (broadcast to all users or specific roles)
export const createSystemNotification = mutation({
  args: {
    title: v.string(),
    body: v.optional(v.string()),
    recipients: v.array(v.id("users")),
    priority: v.optional(v.union(v.literal("low"), v.literal("normal"), v.literal("high"))),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const notificationIds = await Promise.all(
      args.recipients.map((recipient) =>
        ctx.db.insert("workflow_notifications", {
          recipient,
          category: "rapor",
          title: args.title,
          body: args.body,
          status: "beklemede",
          created_at: now,
          metadata: { priority: args.priority || "normal", type: "system" },
        })
      )
    );

    return { count: notificationIds.length, ids: notificationIds };
  },
});

