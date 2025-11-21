import { NextRequest, NextResponse } from 'next/server';
import { getConvexHttp } from '@/lib/convex/server';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import logger from '@/lib/logger';
import {
  requireAuthenticatedUser,
  verifyCsrfToken,
  buildErrorResponse,
} from '@/lib/api/auth-utils';
import { uploadRateLimit, readOnlyRateLimit, dataModificationRateLimit } from '@/lib/rate-limit';

/**
 * POST /api/upload
 * Generate upload URL for file upload
 * Requires authentication - prevents anonymous upload URL generation
 *
 * SECURITY CRITICAL: Upload URL generation without auth = file upload abuse
 */
async function postUploadHandler(_request: NextRequest) {
  try {
    // Require authentication - prevent anonymous upload URL generation
    await requireAuthenticatedUser();

    const convex = getConvexHttp();

    // Generate upload URL from Convex
    const uploadUrl = await convex.action(api.storage.generateUploadUrl, {});

    return NextResponse.json({
      success: true,
      uploadUrl,
    });
  } catch (error) {
    const authError = buildErrorResponse(error);
    if (authError) {
      return NextResponse.json(authError.body, { status: authError.status });
    }

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
 * GET /api/upload?storageId=...
 * Get file download URL
 * Requires authentication - prevents unauthorized file access
 *
 * SECURITY CRITICAL: File URL access without auth = data leak
 */
async function getUploadHandler(request: NextRequest) {
  try {
    // Require authentication - prevent unauthorized file URL access
    await requireAuthenticatedUser();

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
      storageId: storageId as Id<'_storage'>,
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
    const authError = buildErrorResponse(error);
    if (authError) {
      return NextResponse.json(authError.body, { status: authError.status });
    }

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
 * DELETE /api/upload?storageId=...
 * Delete file
 * Requires authentication and CSRF token - prevents unauthorized file deletion
 *
 * SECURITY CRITICAL: File deletion without auth = data loss
 */
async function deleteUploadHandler(request: NextRequest) {
  try {
    // Verify CSRF token for destructive operations
    await verifyCsrfToken(request);

    // Require authentication - prevent unauthorized file deletion
    await requireAuthenticatedUser();

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
      storageId: storageId as Id<'_storage'>,
    });

    return NextResponse.json({
      success: true,
      message: 'Dosya başarıyla silindi',
    });
  } catch (error) {
    const authError = buildErrorResponse(error);
    if (authError) {
      return NextResponse.json(authError.body, { status: authError.status });
    }

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

// Export handlers with rate limiting
export const POST = uploadRateLimit(postUploadHandler);
export const GET = readOnlyRateLimit(getUploadHandler);
export const DELETE = dataModificationRateLimit(deleteUploadHandler);
