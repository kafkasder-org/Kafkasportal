/**
 * Seed Script for Default Theme Presets
 * Creates 5 beautiful, pre-configured theme presets for the application
 */

import { mutation } from './_generated/server';
import type { MutationCtx } from './_generated/server';

/**
 * Helper function to seed default themes
 * Can be called from mutations
 */
async function seedThemesHandler(ctx: MutationCtx, skipIfExists: boolean = true) {
  const existingThemes = await ctx.db.query('theme_presets').collect();

  // If themes already exist, don't seed again
  if (skipIfExists && existingThemes.length > 0) {
    return {
      success: false,
      message: 'Themes already exist. Skipping seed.',
      count: existingThemes.length,
    };
  }

  // Theme 1: Kafkasder Blue (Default)
  await ctx.db.insert('theme_presets', {
    name: 'Kafkasder Blue',
    description: 'Profesyonel mavi tonları - Varsayılan tema',
    colors: {
      primary: '#3b82f6',
      primary_hover: '#2563eb',
      primary_active: '#1d4ed8',
      secondary: '#6b7280',
      secondary_hover: '#4b5563',
      accent: '#8b5cf6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      background: '#ffffff',
      background_secondary: '#f9fafb',
      background_tertiary: '#f3f4f6',
      text_primary: '#111827',
      text_secondary: '#6b7280',
      text_muted: '#9ca3af',
      border: '#e5e7eb',
      border_hover: '#d1d5db',
      sidebar_bg: '#1f2937',
      sidebar_text: '#d1d5db',
      sidebar_active: '#3b82f6',
    },
    typography: {
      font_family: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
      base_size: 14,
      heading_scale: 1.5,
      line_height: 1.5,
      font_weight_regular: 400,
      font_weight_medium: 500,
      font_weight_bold: 700,
    },
    layout: {
      sidebar_width: 256,
      container_max_width: 1400,
      border_radius: 8,
      spacing_scale: 'normal',
      card_elevation: 'subtle',
    },
    is_default: true,
    is_custom: false,
    created_at: Date.now(),
  });

  // Theme 2: Ocean Green
  await ctx.db.insert('theme_presets', {
    name: 'Ocean Green',
    description: 'Ferah yeşil tonları - Doğa temalı',
    colors: {
      primary: '#059669',
      primary_hover: '#047857',
      primary_active: '#065f46',
      secondary: '#6b7280',
      secondary_hover: '#4b5563',
      accent: '#14b8a6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#06b6d4',
      background: '#ffffff',
      background_secondary: '#f0fdf4',
      background_tertiary: '#dcfce7',
      text_primary: '#111827',
      text_secondary: '#6b7280',
      text_muted: '#9ca3af',
      border: '#d1d5db',
      border_hover: '#a7f3d0',
      sidebar_bg: '#064e3b',
      sidebar_text: '#d1fae5',
      sidebar_active: '#10b981',
    },
    typography: {
      font_family: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
      base_size: 14,
      heading_scale: 1.5,
      line_height: 1.5,
      font_weight_regular: 400,
      font_weight_medium: 500,
      font_weight_bold: 700,
    },
    layout: {
      sidebar_width: 256,
      container_max_width: 1400,
      border_radius: 8,
      spacing_scale: 'normal',
      card_elevation: 'subtle',
    },
    is_default: false,
    is_custom: false,
    created_at: Date.now(),
  });

  // Theme 3: Sunset Orange
  await ctx.db.insert('theme_presets', {
    name: 'Sunset Orange',
    description: 'Sıcak turuncu tonları - Enerjik tema',
    colors: {
      primary: '#f97316',
      primary_hover: '#ea580c',
      primary_active: '#c2410c',
      secondary: '#6b7280',
      secondary_hover: '#4b5563',
      accent: '#fb923c',
      success: '#10b981',
      warning: '#fbbf24',
      error: '#ef4444',
      info: '#f97316',
      background: '#ffffff',
      background_secondary: '#fff7ed',
      background_tertiary: '#fed7aa',
      text_primary: '#111827',
      text_secondary: '#6b7280',
      text_muted: '#9ca3af',
      border: '#d1d5db',
      border_hover: '#fdba74',
      sidebar_bg: '#7c2d12',
      sidebar_text: '#fed7aa',
      sidebar_active: '#fb923c',
    },
    typography: {
      font_family: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
      base_size: 14,
      heading_scale: 1.5,
      line_height: 1.5,
      font_weight_regular: 400,
      font_weight_medium: 500,
      font_weight_bold: 700,
    },
    layout: {
      sidebar_width: 256,
      container_max_width: 1400,
      border_radius: 8,
      spacing_scale: 'normal',
      card_elevation: 'subtle',
    },
    is_default: false,
    is_custom: false,
    created_at: Date.now(),
  });

  // Theme 4: Professional Gray
  await ctx.db.insert('theme_presets', {
    name: 'Professional Gray',
    description: 'Nötr gri tonları - Kurumsal tema',
    colors: {
      primary: '#6b7280',
      primary_hover: '#4b5563',
      primary_active: '#374151',
      secondary: '#9ca3af',
      secondary_hover: '#6b7280',
      accent: '#6366f1',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#6b7280',
      background: '#ffffff',
      background_secondary: '#f9fafb',
      background_tertiary: '#f3f4f6',
      text_primary: '#111827',
      text_secondary: '#6b7280',
      text_muted: '#9ca3af',
      border: '#e5e7eb',
      border_hover: '#d1d5db',
      sidebar_bg: '#111827',
      sidebar_text: '#e5e7eb',
      sidebar_active: '#6366f1',
    },
    typography: {
      font_family: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
      base_size: 14,
      heading_scale: 1.5,
      line_height: 1.5,
      font_weight_regular: 400,
      font_weight_medium: 500,
      font_weight_bold: 700,
    },
    layout: {
      sidebar_width: 256,
      container_max_width: 1400,
      border_radius: 6,
      spacing_scale: 'tight',
      card_elevation: 'flat',
    },
    is_default: false,
    is_custom: false,
    created_at: Date.now(),
  });

  // Theme 5: Minimal Black & White
  await ctx.db.insert('theme_presets', {
    name: 'Minimal Black & White',
    description: 'Sade siyah-beyaz - Minimalist tema',
    colors: {
      primary: '#000000',
      primary_hover: '#1f2937',
      primary_active: '#374151',
      secondary: '#6b7280',
      secondary_hover: '#4b5563',
      accent: '#374151',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      info: '#000000',
      background: '#ffffff',
      background_secondary: '#fafafa',
      background_tertiary: '#f5f5f5',
      text_primary: '#000000',
      text_secondary: '#525252',
      text_muted: '#737373',
      border: '#e5e5e5',
      border_hover: '#d4d4d4',
      sidebar_bg: '#000000',
      sidebar_text: '#e5e5e5',
      sidebar_active: '#525252',
    },
    typography: {
      font_family: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
      base_size: 14,
      heading_scale: 1.6,
      line_height: 1.6,
      font_weight_regular: 400,
      font_weight_medium: 500,
      font_weight_bold: 700,
    },
    layout: {
      sidebar_width: 240,
      container_max_width: 1200,
      border_radius: 4,
      spacing_scale: 'tight',
      card_elevation: 'flat',
    },
    is_default: false,
    is_custom: false,
    created_at: Date.now(),
  });

  return {
    success: true,
    message: '5 default themes created successfully',
    themes: [
      'Kafkasder Blue (Default)',
      'Ocean Green',
      'Sunset Orange',
      'Professional Gray',
      'Minimal Black & White',
    ],
  };
}

/**
 * Initialize default theme presets
 * Can be run manually or called from setup
 */
export const seedDefaultThemes = mutation({
  handler: async (ctx) => {
    return await seedThemesHandler(ctx, true);
  },
});

/**
 * Clear all themes (use with caution!)
 */
export const clearAllThemes = mutation({
  handler: async (ctx) => {
    const themes = await ctx.db.query('theme_presets').collect();

    for (const theme of themes) {
      await ctx.db.delete(theme._id);
    }

    return {
      success: true,
      message: `Deleted ${themes.length} themes`,
      count: themes.length,
    };
  },
});

/**
 * Re-seed themes (clear and recreate)
 */
export const reseedThemes = mutation({
  handler: async (ctx) => {
    // Clear existing themes
    const themes = await ctx.db.query('theme_presets').collect();
    for (const theme of themes) {
      await ctx.db.delete(theme._id);
    }

    // Re-run seed (skip existence check)
    const result = await seedThemesHandler(ctx, false);
    return result;
  },
});
