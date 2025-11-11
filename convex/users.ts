import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const list = query({
  args: {
    search: v.optional(v.string()),
    role: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 50, 100);
    let users;

    if (args.search) {
      users = await ctx.db
        .query('users')
        .withSearchIndex('by_search', (q) => q.search('name', args.search!))
        .collect();
    } else {
      if (args.role) {
        users = await ctx.db
          .query('users')
          .withIndex('by_role', (q) => q.eq('role', args.role!))
          .collect();
      } else if (args.isActive !== undefined) {
        users = await ctx.db
          .query('users')
          .withIndex('by_is_active', (q) => q.eq('isActive', args.isActive!))
          .collect();
      } else {
        users = await ctx.db.query('users').collect();
      }
    }

    let filtered = users;
    if (args.search) {
      if (args.role) {
        filtered = filtered.filter((user) => user.role === args.role);
      }
      if (args.isActive !== undefined) {
        filtered = filtered.filter((user) => user.isActive === args.isActive);
      }
    } else if (args.role && args.isActive !== undefined) {
      filtered = filtered.filter((user) => user.isActive === args.isActive);
    }

    const total = filtered.length;

    const cursor = args.cursor ? parseInt(args.cursor, 10) : 0;
    const paginated = filtered.slice(cursor, cursor + limit);
    const continueCursor = cursor + paginated.length < total ? (cursor + limit).toString() : null;

    return {
      documents: paginated,
      total,
      continueCursor,
      isDone: !continueCursor,
    };
  },
});

export const get = query({
  args: { id: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const normalized = normalizeEmail(args.email);
    return await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', normalized))
      .first();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.string(),
    permissions: v.array(v.string()),
    passwordHash: v.string(),
    isActive: v.boolean(),
    phone: v.optional(v.string()),
    avatar: v.optional(v.string()),
    labels: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = normalizeEmail(args.email);

    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', normalizedEmail))
      .first();

    if (existingUser) {
      throw new Error('Bu e-posta adresi zaten kullanılıyor');
    }

    return await ctx.db.insert('users', {
      name: args.name.trim(),
      email: normalizedEmail,
      role: args.role.trim(),
      permissions: args.permissions,
      passwordHash: args.passwordHash,
      isActive: args.isActive,
      phone: args.phone?.trim(),
      avatar: args.avatar,
      labels: args.labels,
      createdAt: new Date().toISOString(),
      lastLogin: undefined,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id('users'),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.optional(v.string()),
    permissions: v.optional(v.array(v.string())),
    passwordHash: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    phone: v.optional(v.string()),
    avatar: v.optional(v.string()),
    labels: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const user = await ctx.db.get(id);
    if (!user) {
      throw new Error('Kullanıcı bulunamadı');
    }

    const patch: {
      name?: string;
      email?: string;
      role?: string;
      permissions?: string[];
      passwordHash?: string;
      isActive?: boolean;
      phone?: string;
      avatar?: string;
      labels?: string[];
      lastLogin?: string;
    } = {};

    if (updates.name !== undefined) {
      patch.name = updates.name.trim();
    }

    if (updates.email !== undefined) {
      const normalizedEmail = normalizeEmail(updates.email);
      if (normalizedEmail !== user.email) {
        const existingUser = await ctx.db
          .query('users')
          .withIndex('by_email', (q) => q.eq('email', normalizedEmail))
          .first();

        if (existingUser && existingUser._id !== id) {
          throw new Error('Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor');
        }
      }
      patch.email = normalizedEmail;
    }

    if (updates.role !== undefined) {
      patch.role = updates.role.trim();
    }

    if (updates.permissions !== undefined) {
      patch.permissions = updates.permissions;
    }

    if (updates.passwordHash !== undefined) {
      patch.passwordHash = updates.passwordHash;
    }

    if (updates.isActive !== undefined) {
      patch.isActive = updates.isActive;
    }

    if (updates.phone !== undefined) {
      patch.phone = updates.phone?.trim();
    }

    if (updates.avatar !== undefined) {
      patch.avatar = updates.avatar;
    }

    if (updates.labels !== undefined) {
      patch.labels = updates.labels;
    }

    await ctx.db.patch(id, patch);
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id('users') },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) {
      throw new Error('Kullanıcı bulunamadı');
    }
    await ctx.db.delete(args.id);
    return { success: true };
  },
});
