import { mutation } from './_generated/server';
import bcrypt from 'bcryptjs';

const DEFAULT_SEED_PERMISSIONS = [
  'beneficiaries:access',
  'aid_applications:access',
  'donations:access',
  'scholarships:access',
  'messages:access',
  'workflow:access',
  'finance:access',
  'reports:access',
  'partners:access',
  'settings:access',
  'users:manage',
] as const;

export const seedFirstAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const existingUsers = await ctx.db.query('users').collect();
    const hasManager = existingUsers.some((user) =>
      Array.isArray(user.permissions) ? user.permissions.includes('users:manage') : false
    );

    if (hasManager) {
      return { message: 'Dernek Başkanı zaten mevcut' };
    }

    const email = process.env.FIRST_ADMIN_EMAIL || 'baskan@dernek.org';
    const password = process.env.FIRST_ADMIN_PASSWORD;

    if (!password || password.trim().length < 8) {
      throw new Error(
        'FIRST_ADMIN_PASSWORD ortam değişkeni en az 8 karakter olacak şekilde tanımlanmalıdır.'
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();

    const userId = await ctx.db.insert('users', {
      name: 'Dernek Başkanı',
      email,
      role: 'Dernek Başkanı',
      permissions: [...DEFAULT_SEED_PERMISSIONS],
      passwordHash,
      isActive: true,
      labels: [],
      createdAt: now,
    });

    return {
      message: 'Dernek Başkanı hesabı oluşturuldu',
      id: userId,
    };
  },
});

// Fix existing test users without permissions
export const fixTestUserPermissions = mutation({
  args: {},
  handler: async (ctx) => {
    const testUser = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('email'), 'test@admin.com'))
      .first();

    if (!testUser) {
      return { message: 'Test user not found' };
    }

    // Update with full permissions
    await ctx.db.patch(testUser._id, {
      permissions: [...DEFAULT_SEED_PERMISSIONS],
      role: 'ADMIN',
    });

    return {
      message: 'Test user permissions updated',
      email: testUser.email,
      permissions: DEFAULT_SEED_PERMISSIONS,
    };
  },
});

