import { NextRequest, NextResponse } from 'next/server';
import { getConvexHttp } from '@/lib/convex/server';
import { api } from '@/convex/_generated/api';

// GET - Get settings for a specific category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const { category } = await params;
    const convex = getConvexHttp();

    const settings = await convex.query(api.system_settings.getSettingsByCategory, {
      category,
    });

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (_error) {
    console.error('Settings category GET error:', _error);
    return NextResponse.json(
      { error: _error instanceof Error ? _error.message : 'Ayarlar alınırken hata oluştu' },
      { status: 500 }
    );
  }
}

// POST - Update settings for a category
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const { category } = await params;
    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Geçersiz ayarlar formatı' },
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
      message: `${category} ayarları başarıyla güncellendi`,
    });
  } catch (_error) {
    console.error('Settings category POST error:', _error);
    return NextResponse.json(
      { error: _error instanceof Error ? _error.message : 'Ayarlar kaydedilirken hata oluştu' },
      { status: 500 }
    );
  }
}

