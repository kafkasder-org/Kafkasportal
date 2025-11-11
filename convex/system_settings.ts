import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import type { QueryCtx, MutationCtx } from "./_generated/server";

// Get all settings
export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("system_settings").collect();
    
    // Group by category
    const grouped: Record<string, Record<string, unknown>> = {};
    for (const setting of settings) {
      if (!grouped[setting.category]) {
        grouped[setting.category] = {};
      }
      grouped[setting.category][setting.key] = setting.value;
    }
    
    return grouped;
  },
});

// Get settings by category
export const getSettingsByCategory = query({
  args: {
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("system_settings")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
    
    const result: Record<string, unknown> = {};
    for (const setting of settings) {
      result[setting.key] = setting.value;
    }
    
    return result;
  },
});

// Helper function to get a single setting
export async function getSettingValue(
  ctx: QueryCtx | MutationCtx,
  category: string,
  key: string
): Promise<unknown> {
  const setting = await ctx.db
    .query("system_settings")
    .withIndex("by_category_key", (q) =>
      q.eq("category", category).eq("key", key)
    )
    .first();

  return setting?.value ?? null;
}

// Get a single setting (Convex query)
export const getSetting = query({
  args: {
    category: v.string(),
    key: v.string(),
  },
  handler: async (ctx, args) => {
    return await getSettingValue(ctx, args.category, args.key);
  },
});

// Update settings for a category (bulk update)
// Optimized to use indexed queries per setting to minimize read scope
// and reduce write conflicts when called concurrently
export const updateSettings = mutation({
  args: {
    category: v.string(),
    settings: v.object({}), // Dynamic object with key-value pairs
    updatedBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const settingsObj = args.settings as Record<string, unknown>;
    const updatedAt = new Date().toISOString();
    
    // Process each setting individually using indexed queries
    // This minimizes the read scope and reduces conflicts
    for (const [key, value] of Object.entries(settingsObj)) {
      // Determine data type
      let dataType: 'string' | 'number' | 'boolean' | 'object' | 'array' = 'string';
      if (typeof value === 'number') dataType = 'number';
      else if (typeof value === 'boolean') dataType = 'boolean';
      else if (Array.isArray(value)) dataType = 'array';
      else if (typeof value === 'object' && value !== null) dataType = 'object';
      
      // Check if setting exists
      const existing = await ctx.db
        .query("system_settings")
        .withIndex("by_category_key", (q) => 
          q.eq("category", args.category).eq("key", key)
        )
        .first();
      
      if (existing) {
        // Update existing
        await ctx.db.patch(existing._id, {
          value,
          data_type: dataType,
          updated_by: args.updatedBy,
          updated_at: updatedAt,
        });
      } else {
        // Create new
        await ctx.db.insert("system_settings", {
          category: args.category,
          key,
          value,
          data_type: dataType,
          is_sensitive: key.toLowerCase().includes('password') || key.toLowerCase().includes('secret') || key.toLowerCase().includes('key'),
          updated_by: args.updatedBy,
          updated_at: updatedAt,
        });
      }
    }
    
    return { success: true };
  },
});

// Update a single setting
export const updateSetting = mutation({
  args: {
    category: v.string(),
    key: v.string(),
    value: v.any(),
    updatedBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const updatedAt = new Date().toISOString();
    
    // Determine data type
    let dataType: 'string' | 'number' | 'boolean' | 'object' | 'array' = 'string';
    if (typeof args.value === 'number') dataType = 'number';
    else if (typeof args.value === 'boolean') dataType = 'boolean';
    else if (Array.isArray(args.value)) dataType = 'array';
    else if (typeof args.value === 'object' && args.value !== null) dataType = 'object';
    
    // Check if setting exists
    const existing = await ctx.db
      .query("system_settings")
      .withIndex("by_category_key", (q) => 
        q.eq("category", args.category).eq("key", args.key)
      )
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.value,
        data_type: dataType,
        updated_by: args.updatedBy,
        updated_at: updatedAt,
      });
    } else {
      await ctx.db.insert("system_settings", {
        category: args.category,
        key: args.key,
        value: args.value,
        data_type: dataType,
        is_sensitive: args.key.toLowerCase().includes('password') || args.key.toLowerCase().includes('secret') || args.key.toLowerCase().includes('key'),
        updated_by: args.updatedBy,
        updated_at: updatedAt,
      });
    }
    
    return { success: true };
  },
});

// Reset settings to defaults
// Optimized to avoid write conflicts by deleting documents incrementally
// instead of reading the entire table first
export const resetSettings = mutation({
  args: {
    category: v.optional(v.string()),
    updatedBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let deletedCount = 0;
    const batchSize = 50; // Process in smaller batches to reduce conflicts
    
    // If category specified, reset only that category
    if (args.category) {
      const category = args.category; // Type narrowing
      
      // Delete in batches to avoid reading entire table at once
      // This reduces write conflicts when other mutations modify settings concurrently
      while (true) {
        const settings = await ctx.db
          .query("system_settings")
          .withIndex("by_category", (q) => q.eq("category", category))
          .take(batchSize);
        
        if (settings.length === 0) {
          break; // No more settings to delete
        }
        
        // Delete this batch
        for (const setting of settings) {
          await ctx.db.delete(setting._id);
          deletedCount++;
        }
        
        // If we got fewer than batchSize, we're done
        if (settings.length < batchSize) {
          break;
        }
      }
    } else {
      // Reset all settings - delete in batches
      while (true) {
        const settings = await ctx.db
          .query("system_settings")
          .take(batchSize);
        
        if (settings.length === 0) {
          break; // No more settings to delete
        }
        
        // Delete this batch
        for (const setting of settings) {
          await ctx.db.delete(setting._id);
          deletedCount++;
        }
        
        // If we got fewer than batchSize, we're done
        if (settings.length < batchSize) {
          break;
        }
      }
    }
    
    return { success: true, deletedCount };
  },
});

