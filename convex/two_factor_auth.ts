import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Enable 2FA for a user (stores secret)
export const enable2FA = mutation({
  args: {
    userId: v.id("users"),
    secret: v.string(),
    backupCodes: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if 2FA already enabled
    const existing = await ctx.db
      .query("two_factor_settings")
      .withIndex("by_user", (q) => q.eq("user_id", args.userId))
      .first();

    if (existing) {
      throw new Error("2FA is already enabled for this user");
    }

    // Create 2FA settings
    const settingId = await ctx.db.insert("two_factor_settings", {
      user_id: args.userId,
      secret: args.secret, // Should be encrypted in production
      backup_codes: args.backupCodes.map((code) => ({
        code,
        used: false,
      })),
      enabled: true,
      enabled_at: new Date().toISOString(),
      last_verified: new Date().toISOString(),
    });

    // Update user record
    await ctx.db.patch(args.userId, {
      two_factor_enabled: true,
    });

    // Log security event
    await ctx.db.insert("security_events", {
      event_type: "2fa_enabled",
      user_id: args.userId,
      severity: "medium",
      occurred_at: new Date().toISOString(),
      reviewed: false,
    });

    return {
      success: true,
      settingId,
      backupCodesCount: args.backupCodes.length,
    };
  },
});

// Disable 2FA
export const disable2FA = mutation({
  args: {
    userId: v.id("users"),
    verificationCode: v.string(), // Require verification before disabling
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("two_factor_settings")
      .withIndex("by_user", (q) => q.eq("user_id", args.userId))
      .first();

    if (!settings) {
      throw new Error("2FA is not enabled for this user");
    }

    // In production, verify the code here
    // const isValid = verifyTOTPCode(settings.secret, args.verificationCode);
    // if (!isValid) throw new Error("Invalid verification code");

    // Disable 2FA
    await ctx.db.patch(settings._id, {
      enabled: false,
      disabled_at: new Date().toISOString(),
    });

    // Update user record
    await ctx.db.patch(args.userId, {
      two_factor_enabled: false,
    });

    // Log security event
    await ctx.db.insert("security_events", {
      event_type: "2fa_disabled",
      user_id: args.userId,
      severity: "high",
      occurred_at: new Date().toISOString(),
      reviewed: false,
    });

    return { success: true };
  },
});

// Verify 2FA code
export const verify2FACode = mutation({
  args: {
    userId: v.id("users"),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("two_factor_settings")
      .withIndex("by_user", (q) => q.eq("user_id", args.userId))
      .first();

    if (!settings || !settings.enabled) {
      throw new Error("2FA is not enabled for this user");
    }

    // In production, use a proper TOTP library (e.g., otpauth, speakeasy)
    // const isValid = verifyTOTPCode(settings.secret, args.code);
    
    // For now, simulate validation
    const isValid = args.code.length === 6; // Placeholder validation

    if (isValid) {
      // Update last verified timestamp
      await ctx.db.patch(settings._id, {
        last_verified: new Date().toISOString(),
      });

      // Log successful verification
      await ctx.db.insert("security_events", {
        event_type: "login_success",
        user_id: args.userId,
        severity: "low",
        details: { method: "2fa" },
        occurred_at: new Date().toISOString(),
        reviewed: false,
      });

      return { success: true, verified: true };
    }

    // Log failed verification
    await ctx.db.insert("security_events", {
      event_type: "login_failure",
      user_id: args.userId,
      severity: "medium",
      details: { method: "2fa", reason: "invalid_code" },
      occurred_at: new Date().toISOString(),
      reviewed: false,
    });

    return { success: false, verified: false, error: "Invalid verification code" };
  },
});

// Use backup code
export const useBackupCode = mutation({
  args: {
    userId: v.id("users"),
    backupCode: v.string(),
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("two_factor_settings")
      .withIndex("by_user", (q) => q.eq("user_id", args.userId))
      .first();

    if (!settings || !settings.enabled) {
      throw new Error("2FA is not enabled for this user");
    }

    // Find matching backup code
    const backupCodeIndex = settings.backup_codes.findIndex(
      (bc) => bc.code === args.backupCode && !bc.used
    );

    if (backupCodeIndex === -1) {
      return { success: false, error: "Invalid or already used backup code" };
    }

    // Mark backup code as used
    const updatedBackupCodes = [...settings.backup_codes];
    updatedBackupCodes[backupCodeIndex] = {
      ...updatedBackupCodes[backupCodeIndex],
      used: true,
      used_at: new Date().toISOString(),
    };

    await ctx.db.patch(settings._id, {
      backup_codes: updatedBackupCodes,
    });

    // Log backup code usage
    await ctx.db.insert("security_events", {
      event_type: "login_success",
      user_id: args.userId,
      severity: "medium",
      details: { method: "backup_code" },
      occurred_at: new Date().toISOString(),
      reviewed: false,
    });

    const remainingCodes = updatedBackupCodes.filter((bc) => !bc.used).length;

    return {
      success: true,
      verified: true,
      remainingBackupCodes: remainingCodes,
      warning: remainingCodes < 3 ? "You have less than 3 backup codes remaining" : null,
    };
  },
});

// Regenerate backup codes
export const regenerateBackupCodes = mutation({
  args: {
    userId: v.id("users"),
    newBackupCodes: v.array(v.string()),
    verificationCode: v.string(), // Require 2FA verification
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("two_factor_settings")
      .withIndex("by_user", (q) => q.eq("user_id", args.userId))
      .first();

    if (!settings || !settings.enabled) {
      throw new Error("2FA is not enabled for this user");
    }

    // In production, verify the 2FA code first
    // const isValid = verifyTOTPCode(settings.secret, args.verificationCode);
    // if (!isValid) throw new Error("Invalid verification code");

    // Replace backup codes
    await ctx.db.patch(settings._id, {
      backup_codes: args.newBackupCodes.map((code) => ({
        code,
        used: false,
      })),
    });

    // Log security event
    await ctx.db.insert("security_events", {
      event_type: "password_change",
      user_id: args.userId,
      severity: "medium",
      details: { action: "backup_codes_regenerated" },
      occurred_at: new Date().toISOString(),
      reviewed: false,
    });

    return {
      success: true,
      backupCodesCount: args.newBackupCodes.length,
    };
  },
});

// Get 2FA status
export const get2FAStatus = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("two_factor_settings")
      .withIndex("by_user", (q) => q.eq("user_id", args.userId))
      .first();

    if (!settings) {
      return {
        enabled: false,
        enrolledAt: null,
        backupCodesRemaining: 0,
      };
    }

    const remainingBackupCodes = settings.backup_codes.filter((bc) => !bc.used).length;

    return {
      enabled: settings.enabled,
      enrolledAt: settings.enabled_at,
      lastVerified: settings.last_verified,
      backupCodesRemaining: remainingBackupCodes,
      needsNewBackupCodes: remainingBackupCodes < 3,
    };
  },
});

// Add trusted device
export const addTrustedDevice = mutation({
  args: {
    userId: v.id("users"),
    deviceFingerprint: v.string(),
    deviceName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("trusted_devices", {
      user_id: args.userId,
      device_fingerprint: args.deviceFingerprint,
      device_name: args.deviceName || "Unknown Device",
      added_at: new Date().toISOString(),
      last_used: new Date().toISOString(),
      is_active: true,
    });
  },
});

// Check if device is trusted
export const isDeviceTrusted = query({
  args: {
    userId: v.id("users"),
    deviceFingerprint: v.string(),
  },
  handler: async (ctx, args) => {
    const device = await ctx.db
      .query("trusted_devices")
      .filter((q) =>
        q.and(
          q.eq(q.field("user_id"), args.userId),
          q.eq(q.field("device_fingerprint"), args.deviceFingerprint),
          q.eq(q.field("is_active"), true)
        )
      )
      .first();

    return !!device;
  },
});

// Remove trusted device
export const removeTrustedDevice = mutation({
  args: {
    deviceId: v.id("trusted_devices"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.deviceId, {
      is_active: false,
      removed_at: new Date().toISOString(),
    });

    return { success: true };
  },
});
