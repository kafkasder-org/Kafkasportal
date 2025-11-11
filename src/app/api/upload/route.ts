import { NextRequest, NextResponse } from 'next/server';
import { getConvexHttp } from '@/lib/convex/server';
import { api } from '@/convex/_generated/api';
import logger from '@/lib/logger';

/**
 * POST /api/upload
 * Generate upload URL for file upload
 */
export async function POST(_request: NextRequest) {
  try {
    const convex = getConvexHttp();

    // Generate upload URL from Convex
    const uploadUrl = await convex.action(api.storage.generateUploadUrl, {});

    return NextResponse.json({
      success: true,
      uploadUrl,
    });
  } catch (error) {
    logger.error('Error generating upload URL:', error);
    return NextResponse.json(
      {
        success: false,
        error: "Dosya yükleme URL'si oluşturulamadı",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/upload/[storageId]
 * Get file download URL
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const storageId = url.searchParams.get('storageId');

    if (!storageId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Storage ID gerekli',
        },
        { status: 400 }
      );
    }

    const convex = getConvexHttp();

    // Get download URL from Convex
    const downloadUrl = await convex.query(api.storage.getFileUrl, {
      storageId: storageId as unknown as any,
    });

    if (!downloadUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dosya bulunamadı',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      url: downloadUrl,
    });
  } catch (error) {
    logger.error('Error getting download URL:', error);
    return NextResponse.json(
      {
        success: false,
        error: "Dosya URL'si alınamadı",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/upload/[storageId]
 * Delete file
 */
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const storageId = url.searchParams.get('storageId');

    if (!storageId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Storage ID gerekli',
        },
        { status: 400 }
      );
    }

    const convex = getConvexHttp();

    // Delete file from Convex
    await convex.action(api.storage.deleteFile, {
      storageId: storageId as unknown as any,
    });

    return NextResponse.json({
      success: true,
      message: 'Dosya başarıyla silindi',
    });
  } catch (error) {
    logger.error('Error deleting file:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Dosya silinemedi',
      },
      { status: 500 }
    );
  }
}
