import { query, mutation } from './_generated/server';
import type { MutationCtx } from './_generated/server';
import type { Id, Doc } from './_generated/dataModel';
import { v } from 'convex/values';

const actionStatus = v.union(
  v.literal('beklemede'),
  v.literal('devam'),
  v.literal('hazir'),
  v.literal('iptal')
);

export const list = query({
  args: {
    meeting_id: v.optional(v.id('meetings')),
    assigned_to: v.optional(v.id('users')),
    status: v.optional(actionStatus),
  },
  handler: async (ctx, args) => {
    const { meeting_id, assigned_to, status } = args;

    if (meeting_id) {
      return await ctx.db
        .query('meeting_action_items')
        .withIndex('by_meeting', (q) => q.eq('meeting_id', meeting_id))
        .collect();
    }

    if (assigned_to) {
      return await ctx.db
        .query('meeting_action_items')
        .withIndex('by_assigned_to', (q) => q.eq('assigned_to', assigned_to))
        .collect();
    }

    if (status) {
      return await ctx.db
        .query('meeting_action_items')
        .withIndex('by_status', (q) => q.eq('status', status))
        .collect();
    }

    return await ctx.db.query('meeting_action_items').collect();
  },
});

export const get = query({
  args: { id: v.id('meeting_action_items') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    meeting_id: v.id('meetings'),
    decision_id: v.optional(v.id('meeting_decisions')),
    title: v.string(),
    description: v.optional(v.string()),
    assigned_to: v.id('users'),
    created_by: v.id('users'),
    status: v.optional(actionStatus),
    due_date: v.optional(v.string()),
    notes: v.optional(v.array(v.string())),
    reminder_scheduled_at: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const status = args.status ?? 'beklemede';

    return await ctx.db.insert('meeting_action_items', {
      meeting_id: args.meeting_id,
      decision_id: args.decision_id,
      title: args.title,
      description: args.description,
      assigned_to: args.assigned_to,
      created_by: args.created_by,
      created_at: now,
      status,
      due_date: args.due_date,
      completed_at: status === 'hazir' ? now : undefined,
      status_history: [
        {
          status,
          changed_at: now,
          changed_by: args.created_by,
          note: 'Görev oluşturuldu',
        },
      ],
      notes: args.notes,
      reminder_scheduled_at: args.reminder_scheduled_at,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id('meeting_action_items'),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    assigned_to: v.optional(v.id('users')),
    status: v.optional(actionStatus),
    due_date: v.optional(v.string()),
    completed_at: v.optional(v.string()),
    notes: v.optional(v.array(v.string())),
    reminder_scheduled_at: v.optional(v.string()),
    changed_by: v.optional(v.id('users')),
  },
  handler: async (ctx, args) => {
    const { id, status, changed_by, ...updates } = args;
    const actionItem = await ctx.db.get(id);

    if (!actionItem) {
      throw new Error('Action item not found');
    }

    let completed_at = updates.completed_at ?? actionItem.completed_at;
    const status_history = [...(actionItem.status_history ?? [])];
    const patch: Record<string, unknown> = { ...updates };

    const statusChanged = status && status !== actionItem.status;

    if (statusChanged) {
      const now = new Date().toISOString();
      completed_at = status === 'hazir' ? now : undefined;

      status_history.push({
        status,
        changed_at: now,
        changed_by: changed_by ?? actionItem.assigned_to,
      });

      patch.status = status;
    }

    patch.status_history = status_history;
    patch.completed_at = completed_at;

    await ctx.db.patch(id, patch);
    const updated = await ctx.db.get(id);

    if (statusChanged) {
      await notifyAdminsOnCompletion(
        ctx,
        updated,
        status as 'beklemede' | 'devam' | 'hazir' | 'iptal',
        changed_by ?? actionItem.assigned_to
      );
    }

    return updated;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id('meeting_action_items'),
    status: actionStatus,
    changed_by: v.id('users'),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actionItem = await ctx.db.get(args.id);
    if (!actionItem) {
      throw new Error('Action item not found');
    }

    const now = new Date().toISOString();
    const history = [...(actionItem.status_history ?? [])];

    history.push({
      status: args.status,
      changed_at: now,
      changed_by: args.changed_by,
      note: args.note,
    });

    await ctx.db.patch(args.id, {
      status: args.status,
      status_history: history,
      completed_at: args.status === 'hazir' ? now : undefined,
    });

    const updated = await ctx.db.get(args.id);
    await notifyAdminsOnCompletion(
      ctx,
      updated,
      args.status,
      args.changed_by,
      args.note ?? undefined
    );

    return updated;
  },
});

async function notifyAdminsOnCompletion(
  ctx: MutationCtx,
  actionItem: Doc<'meeting_action_items'> | null,
  status: 'beklemede' | 'devam' | 'hazir' | 'iptal',
  triggeredBy: Id<'users'>,
  note?: string
) {
  if (!actionItem || status !== 'hazir') {
    return;
  }

  const now = new Date().toISOString();
  const referenceId = actionItem._id ? String(actionItem._id) : null;
  const meetingId = actionItem.meeting_id ? String(actionItem.meeting_id) : null;
  const decisionId = actionItem.decision_id ? String(actionItem.decision_id) : undefined;
  const title = typeof actionItem.title === 'string' ? actionItem.title : 'Görev';

  if (!referenceId || !meetingId) {
    return;
  }

  const [admins, superAdmins] = await Promise.all([
    ctx.db
      .query('users')
      .withIndex('by_role', (q) => q.eq('role', 'ADMIN'))
      .collect(),
    ctx.db
      .query('users')
      .withIndex('by_role', (q) => q.eq('role', 'SUPER_ADMIN'))
      .collect(),
  ]);

  const recipients = new Set<Id<'users'>>();
  admins.forEach((admin) => recipients.add(admin._id));
  superAdmins.forEach((admin) => recipients.add(admin._id));

  if (recipients.size === 0) {
    return;
  }

  await Promise.all(
    Array.from(recipients).map((recipient) =>
      ctx.db.insert('workflow_notifications', {
        recipient,
        triggered_by: triggeredBy,
        category: 'gorev',
        title: 'Görev tamamlandı',
        body: `${title} görevi hazır olarak işaretlendi.`,
        status: 'beklemede',
        created_at: now,
        reference: {
          type: 'meeting_action_item',
          id: referenceId,
        },
        metadata: {
          meeting_id: meetingId,
          decision_id: decisionId,
          note,
        },
      })
    )
  );
}

export const remove = mutation({
  args: { id: v.id('meeting_action_items') },
  handler: async (ctx, args) => {
    const actionItem = await ctx.db.get(args.id);
    if (!actionItem) {
      throw new Error('Action item not found');
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});
