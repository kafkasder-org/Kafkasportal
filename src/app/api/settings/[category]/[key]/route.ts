import { NextRequest, NextResponse } from 'next/server';
import { getConvexHttp } from '@/lib/convex/server';
import { api } from '@/convex/_generated/api';

// GET - Get a single setting
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string; key: string }> }
) {
  try {
    const { category, key } = await params;
    const convex = getConvexHttp();

    const value = await convex.query(api.system_settings.getSetting, {
      category,
      key,
    });

    return NextResponse.json({
      success: true,
      data: { category, key, value },
    });
  } catch (_error) {
    console.error('Setting GET error:', _error);
    return NextResponse.json(
      { error: _error instanceof Error ? _error.message : 'Ayar alınırken hata oluştu' },
      { status: 500 }
    );
  }
}

// PUT - Update a single setting
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ category: string; key: string }> }
) {
  try {
    const { category, key } = await params;
    const body = await request.json();
    const { value } = body;

    if (value === undefined) {
      return NextResponse.json(
        { error: 'Değer gerekli' },
        { status: 400 }
      );
    }

    const convex = getConvexHttp();
    await convex.mutation(api.system_settings.updateSetting, {
      category,
      key,
      value,
    });

    return NextResponse.json({
      success: true,
      message: 'Ayar başarıyla güncellendi',
    });
  } catch (_error) {
    console.error('Setting PUT error:', _error);
    return NextResponse.json(
      { error: _error instanceof Error ? _error.message : 'Ayar güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}

