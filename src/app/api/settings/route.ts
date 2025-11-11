import { NextRequest, NextResponse } from 'next/server';
import { getConvexHttp } from '@/lib/convex/server';
import { api } from '@/convex/_generated/api';

// GET - Get all settings or settings by category
export async function GET(request: NextRequest) {
  try {
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
  } catch (_error) {
    console.error('Settings GET error:', _error);
    return NextResponse.json(
      { error: _error instanceof Error ? _error.message : 'Ayarlar alınırken hata oluştu' },
      { status: 500 }
    );
  }
}

// POST - Create or update settings (bulk)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, settings } = body;

    if (!category || !settings) {
      return NextResponse.json(
        { error: 'Kategori ve ayarlar gerekli' },
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
  } catch (_error) {
    console.error('Settings POST error:', _error);
    return NextResponse.json(
      { error: _error instanceof Error ? _error.message : 'Ayarlar kaydedilirken hata oluştu' },
      { status: 500 }
    );
  }
}

// PUT - Update all settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings } = body; // { category: { key: value } }

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Geçersiz ayarlar formatı' },
        { status: 400 }
      );
    }

    const convex = getConvexHttp();

    // Update each category
    for (const [category, categorySettings] of Object.entries(settings)) {
      if (categorySettings && typeof categorySettings === 'object') {
        await convex.mutation(api.system_settings.updateSettings, {
          category,
          settings: categorySettings as Record<string, any>,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Tüm ayarlar başarıyla güncellendi',
    });
  } catch (_error) {
    console.error('Settings PUT error:', _error);
    return NextResponse.json(
      { error: _error instanceof Error ? _error.message : 'Ayarlar güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE - Reset settings
export async function DELETE(request: NextRequest) {
  try {
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
  } catch (_error) {
    console.error('Settings DELETE error:', _error);
    return NextResponse.json(
      { error: _error instanceof Error ? _error.message : 'Ayarlar sıfırlanırken hata oluştu' },
      { status: 500 }
    );
  }
}

