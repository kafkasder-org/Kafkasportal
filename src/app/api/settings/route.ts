import { NextRequest, NextResponse } from 'next/server';
import { getConvexHttp } from '@/lib/convex/server';
import { api } from '@/convex/_generated/api';
import logger from '@/lib/logger';
import {
  requireAuthenticatedUser,
  verifyCsrfToken,
  buildErrorResponse,
} from '@/lib/api/auth-utils';
import { readOnlyRateLimit, dataModificationRateLimit } from '@/lib/rate-limit';

/**
 * GET - Get all settings or settings by category
 * Requires authentication and settings:manage permission
 */
async function getSettingsHandler(request: NextRequest) {
  try {
    // Require authentication with settings:manage permission
    const { user } = await requireAuthenticatedUser();
    if (!user.permissions.includes('settings:manage')) {
      return NextResponse.json(
        { success: false, error: 'Bu işlemi gerçekleştirmek için yetkiniz yok' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const convex = getConvexHttp();

    let settings;
    if (category) {
      settings = await convex.query(api.system_settings.getSettingsByCategory, {
        category,
      });
    } else {
      settings = await convex.query(api.system_settings.getSettings, {});
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    const authError = buildErrorResponse(error);
    if (authError) {
      return NextResponse.json(authError.body, { status: authError.status });
    }

    logger.error('Settings GET error', error);
    return NextResponse.json(
      { success: false, error: 'Ayarlar alınırken hata oluştu' },
      { status: 500 }
    );
  }
}

/**
 * POST - Create or update settings (bulk)
 * Requires authentication, CSRF token, and settings:manage permission
 */
async function postSettingsHandler(request: NextRequest) {
  try {
    // Verify CSRF token
    await verifyCsrfToken(request);

    // Require authentication with settings:manage permission
    const { user } = await requireAuthenticatedUser();
    if (!user.permissions.includes('settings:manage')) {
      return NextResponse.json(
        { success: false, error: 'Bu işlemi gerçekleştirmek için yetkiniz yok' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { category, settings } = body;

    if (!category || !settings) {
      return NextResponse.json(
        { success: false, error: 'Kategori ve ayarlar gerekli' },
        { status: 400 }
      );
    }

    const convex = getConvexHttp();
    await convex.mutation(api.system_settings.updateSettings, {
      category,
      settings,
    });

    return NextResponse.json({
      success: true,
      message: 'Ayarlar başarıyla kaydedildi',
    });
  } catch (error) {
    const authError = buildErrorResponse(error);
    if (authError) {
      return NextResponse.json(authError.body, { status: authError.status });
    }

    logger.error('Settings POST error', error);
    return NextResponse.json(
      { success: false, error: 'Ayarlar kaydedilirken hata oluştu' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update all settings
 * Requires authentication, CSRF token, and settings:manage permission
 */
async function putSettingsHandler(request: NextRequest) {
  try {
    // Verify CSRF token
    await verifyCsrfToken(request);

    // Require authentication with settings:manage permission
    const { user } = await requireAuthenticatedUser();
    if (!user.permissions.includes('settings:manage')) {
      return NextResponse.json(
        { success: false, error: 'Bu işlemi gerçekleştirmek için yetkiniz yok' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { settings } = body; // { category: { key: value } }

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Geçersiz ayarlar formatı' },
        { status: 400 }
      );
    }

    const convex = getConvexHttp();

    // Update each category
    for (const [category, categorySettings] of Object.entries(settings)) {
      if (categorySettings && typeof categorySettings === 'object') {
        await convex.mutation(api.system_settings.updateSettings, {
          category,
          settings: categorySettings as Record<string, unknown>,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Tüm ayarlar başarıyla güncellendi',
    });
  } catch (error) {
    const authError = buildErrorResponse(error);
    if (authError) {
      return NextResponse.json(authError.body, { status: authError.status });
    }

    logger.error('Settings PUT error', error);
    return NextResponse.json(
      { success: false, error: 'Ayarlar güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Reset settings
 * Requires authentication, CSRF token, and settings:manage permission
 */
async function deleteSettingsHandler(request: NextRequest) {
  try {
    // Verify CSRF token
    await verifyCsrfToken(request);

    // Require authentication with settings:manage permission
    const { user } = await requireAuthenticatedUser();
    if (!user.permissions.includes('settings:manage')) {
      return NextResponse.json(
        { success: false, error: 'Bu işlemi gerçekleştirmek için yetkiniz yok' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const convex = getConvexHttp();
    await convex.mutation(api.system_settings.resetSettings, {
      category: category || undefined,
    });

    return NextResponse.json({
      success: true,
      message: category ? `${category} kategorisi sıfırlandı` : 'Tüm ayarlar sıfırlandı',
    });
  } catch (error) {
    const authError = buildErrorResponse(error);
    if (authError) {
      return NextResponse.json(authError.body, { status: authError.status });
    }

    logger.error('Settings DELETE error', error);
    return NextResponse.json(
      { success: false, error: 'Ayarlar sıfırlanırken hata oluştu' },
      { status: 500 }
    );
  }
}

// Export handlers with rate limiting
export const GET = readOnlyRateLimit(getSettingsHandler);
export const POST = dataModificationRateLimit(postSettingsHandler);
export const PUT = dataModificationRateLimit(putSettingsHandler);
export const DELETE = dataModificationRateLimit(deleteSettingsHandler);
