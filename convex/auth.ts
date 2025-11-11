import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get current user by ID
 * Note: Password verification should be done in Next.js API routes
 * as Convex cannot run bcrypt (native module)
 */
export const getCurrentUser = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.userId) {
      return null;
    }
    
    const user = await ctx.db.get(args.userId);
    
    if (!user || !user.isActive) {
      return null;
    }

    // Return user without password hash
     
    const { passwordHash: _passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
});

/**
 * Get user by email (for login)
 * Note: This is used by Next.js API routes for authentication
 * Password verification is done in Next.js, not here
 */
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      return null;
    }

    // Return user with password hash (needed for verification in Next.js)
    return user;
  },
});

/**
 * Update last login time
 */
export const updateLastLogin = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(args.userId, {
      lastLogin: new Date().toISOString(),
    });

    return { success: true };
  },
});

/**
 * Logout mutation
 * Note: Session invalidation is handled in Next.js via cookies
 */
export const logout = mutation({
  args: {},
  handler: async (_ctx) => {
    // Session is managed in Next.js cookies, nothing to do here
    return { success: true };
  },
});

