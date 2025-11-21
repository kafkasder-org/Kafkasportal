/**
 * Convex Mutations and Queries for Security Settings
 * Handles password policies, session management, 2FA, and security configurations
 */

import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { requireIdentity } from './authz';

/**
 * Get all security settings
 */
export const getSecuritySettings = query({
  handler: async (ctx) => {
    await requireIdentity(ctx);
    const settings = await ctx.db
      .query('system_settings')
      .withIndex('by_category', (q) => q.eq('category', 'security'))
      .collect();

    // Convert to key-value object
    const settingsObject: Record<string, any> = {};
    settings.forEach((setting) => {
      settingsObject[setting.key] = setting.value;
    });

    return settingsObject;
  },
});

/**
 * Update password policy settings
 */
export const updatePasswordPolicy = mutation({
  args: {
    minLength: v.optional(v.number()),
    requireUppercase: v.optional(v.boolean()),
    requireLowercase: v.optional(v.boolean()),
    requireNumbers: v.optional(v.boolean()),
    requireSpecialChars: v.optional(v.boolean()),
    maxAge: v.optional(v.number()), // days until password expires
    preventReuse: v.optional(v.number()), // number of previous passwords to check
    lockoutAttempts: v.optional(v.number()),
    lockoutDuration: v.optional(v.number()), // minutes
  },
  handler: async (ctx, args) => {
    await requireIdentity(ctx);
    const updates = [];

    for (const [key, value] of Object.entries(args)) {
      if (value !== undefined) {
        const existing = await ctx.db
          .query('system_settings')
          .withIndex('by_category_and_key', (q) => q.eq('category', 'security').eq('key', key))
          .first();

        if (existing) {
          await ctx.db.patch(existing._id, {
            value,
            updated_at: Date.now(),
            version: (existing.version ?? 0) + 1,
          });
        } else {
          await ctx.db.insert('system_settings', {
            category: 'security',
            key,
            value,
            is_public: false,
            is_encrypted: false,
            data_type: typeof value === 'boolean' ? 'boolean' : 'number',
            updated_at: Date.now(),
            version: 1,
          });
        }
        updates.push(key);
      }
    }

    return {
      success: true,
      message: `Updated ${updates.length} password policy settings`,
      updated: updates,
    };
  },
});

/**
 * Update session management settings
 */
export const updateSessionSettings = mutation({
  args: {
    sessionTimeout: v.optional(v.number()), // minutes
    maxConcurrentSessions: v.optional(v.number()),
    requireReauthForSensitive: v.optional(v.boolean()),
    rememberMeDuration: v.optional(v.number()), // days
    enableSessionMonitoring: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireIdentity(ctx);
    const updates = [];

    for (const [key, value] of Object.entries(args)) {
      if (value !== undefined) {
        const existing = await ctx.db
          .query('system_settings')
          .withIndex('by_category_and_key', (q) => q.eq('category', 'security').eq('key', key))
          .first();

        if (existing) {
          await ctx.db.patch(existing._id, {
            value,
            updated_at: Date.now(),
            version: (existing.version ?? 0) + 1,
          });
        } else {
          await ctx.db.insert('system_settings', {
            category: 'security',
            key,
            value,
            is_public: false,
            is_encrypted: false,
            data_type: typeof value === 'boolean' ? 'boolean' : 'number',
            updated_at: Date.now(),
            version: 1,
          });
        }
        updates.push(key);
      }
    }

    return {
      success: true,
      message: `Updated ${updates.length} session settings`,
      updated: updates,
    };
  },
});

/**
 * Update 2FA settings
 */
export const update2FASettings = mutation({
  args: {
    enabled: v.optional(v.boolean()),
    required: v.optional(v.boolean()), // force all users to use 2FA
    methods: v.optional(v.array(v.string())), // ['totp', 'sms', 'email']
    gracePeriod: v.optional(v.number()), // days before 2FA becomes required
  },
  handler: async (ctx, args) => {
    await requireIdentity(ctx);
    const updates = [];

    for (const [key, value] of Object.entries(args)) {
      if (value !== undefined) {
        const existing = await ctx.db
          .query('system_settings')
          .withIndex('by_category_and_key', (q) => q.eq('category', 'security').eq('key', key))
          .first();

        if (existing) {
          await ctx.db.patch(existing._id, {
            value,
            updated_at: Date.now(),
            version: (existing.version ?? 0) + 1,
          });
        } else {
          await ctx.db.insert('system_settings', {
            category: 'security',
            key,
            value,
            is_public: false,
            is_encrypted: false,
            data_type:
              typeof value === 'boolean' ? 'boolean' : Array.isArray(value) ? 'array' : 'number',
            updated_at: Date.now(),
            version: 1,
          });
        }
        updates.push(key);
      }
    }

    return {
      success: true,
      message: `Updated ${updates.length} 2FA settings`,
      updated: updates,
    };
  },
});

/**
 * Update general security settings
 */
export const updateGeneralSecurity = mutation({
  args: {
    enableAuditLog: v.optional(v.boolean()),
    enableIpWhitelist: v.optional(v.boolean()),
    enableRateLimiting: v.optional(v.boolean()),
    enableBruteForceProtection: v.optional(v.boolean()),
    enableCsrfProtection: v.optional(v.boolean()),
    securityEmailAlerts: v.optional(v.boolean()),
    suspiciousActivityThreshold: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireIdentity(ctx);
    const updates = [];

    for (const [key, value] of Object.entries(args)) {
      if (value !== undefined) {
        const existing = await ctx.db
          .query('system_settings')
          .withIndex('by_category_and_key', (q) => q.eq('category', 'security').eq('key', key))
          .first();

        if (existing) {
          await ctx.db.patch(existing._id, {
            value,
            updated_at: Date.now(),
            version: (existing.version ?? 0) + 1,
          });
        } else {
          await ctx.db.insert('system_settings', {
            category: 'security',
            key,
            value,
            is_public: false,
            is_encrypted: false,
            data_type: typeof value === 'boolean' ? 'boolean' : 'number',
            updated_at: Date.now(),
            version: 1,
          });
        }
        updates.push(key);
      }
    }

    return {
      success: true,
      message: `Updated ${updates.length} general security settings`,
      updated: updates,
    };
  },
});

/**
 * Seed default security settings
 */
export const seedDefaultSecurity = mutation({
  handler: async (ctx) => {
    const defaults = [
      // Password Policy
      { key: 'minLength', value: 8, label: 'Minimum Password Length' },
      { key: 'requireUppercase', value: true, label: 'Require Uppercase Letters' },
      { key: 'requireLowercase', value: true, label: 'Require Lowercase Letters' },
      { key: 'requireNumbers', value: true, label: 'Require Numbers' },
      { key: 'requireSpecialChars', value: true, label: 'Require Special Characters' },
      { key: 'maxAge', value: 90, label: 'Password Max Age (days)' },
      { key: 'preventReuse', value: 5, label: 'Prevent Password Reuse (last N passwords)' },
      { key: 'lockoutAttempts', value: 5, label: 'Lockout After N Failed Attempts' },
      { key: 'lockoutDuration', value: 30, label: 'Lockout Duration (minutes)' },

      // Session Management
      { key: 'sessionTimeout', value: 120, label: 'Session Timeout (minutes)' },
      { key: 'maxConcurrentSessions', value: 3, label: 'Max Concurrent Sessions Per User' },
      {
        key: 'requireReauthForSensitive',
        value: true,
        label: 'Require Re-auth for Sensitive Actions',
      },
      { key: 'rememberMeDuration', value: 30, label: 'Remember Me Duration (days)' },
      { key: 'enableSessionMonitoring', value: true, label: 'Enable Session Monitoring' },

      // 2FA
      { key: 'enabled', value: false, label: '2FA Enabled' },
      { key: 'required', value: false, label: '2FA Required for All Users' },
      { key: 'methods', value: ['totp', 'sms', 'email'], label: 'Allowed 2FA Methods' },
      { key: 'gracePeriod', value: 7, label: '2FA Grace Period (days)' },

      // General Security
      { key: 'enableAuditLog', value: true, label: 'Enable Audit Logging' },
      { key: 'enableIpWhitelist', value: false, label: 'Enable IP Whitelist' },
      { key: 'enableRateLimiting', value: true, label: 'Enable Rate Limiting' },
      { key: 'enableBruteForceProtection', value: true, label: 'Enable Brute Force Protection' },
      { key: 'enableCsrfProtection', value: true, label: 'Enable CSRF Protection' },
      { key: 'securityEmailAlerts', value: true, label: 'Send Security Email Alerts' },
      { key: 'suspiciousActivityThreshold', value: 10, label: 'Suspicious Activity Threshold' },
    ];

    for (const setting of defaults) {
      const existing = await ctx.db
        .query('system_settings')
        .withIndex('by_category_and_key', (q) =>
          q.eq('category', 'security').eq('key', setting.key)
        )
        .first();

      if (!existing) {
        await ctx.db.insert('system_settings', {
          category: 'security',
          key: setting.key,
          value: setting.value,
          label: setting.label,
          is_public: false,
          is_encrypted: false,
          data_type:
            typeof setting.value === 'boolean'
              ? 'boolean'
              : Array.isArray(setting.value)
                ? 'array'
                : 'number',
          updated_at: Date.now(),
          version: 1,
        });
      }
    }

    return {
      success: true,
      message: 'Default security settings created',
      count: defaults.length,
    };
  },
});
