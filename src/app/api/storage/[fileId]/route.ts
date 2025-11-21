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

/**
 * GET /api/storage/[fileId]
 * Retrieve a file from storage
 * Requires authentication - prevents unauthorized file access
 *
 * SECURITY CRITICAL: File access without auth = data leak vulnerability
 */
async function getFileHandler(
  _request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    // Require authentication - prevent unauthorized file access
    await requireAuthenticatedUser();

    const { fileId } = await params;
    const convex = getConvexHttp();

    // Get file by storageId using existing query
    const file = await convex.query(api.documents.getFileByStorageId, {
      storageId: fileId as Id<'_storage'>, // storageId is already an Id type in the query
    });

    if (!file) {
      return NextResponse.json({ success: false, error: 'Dosya bulunamadı' }, { status: 404 });
    }

    // Redirect to the file URL from Convex storage
    if (!file.url) {
      return NextResponse.json(
        { success: false, error: "Dosya URL'si bulunamadı" },
        { status: 500 }
      );
    }
    return NextResponse.redirect(file.url);
  } catch (error) {
    const authError = buildErrorResponse(error);
    if (authError) {
      return NextResponse.json(authError.body, { status: authError.status });
    }

    logger.error('File retrieval error', error);
    return NextResponse.json({ success: false, error: 'Dosya alınamadı' }, { status: 500 });
  }
}

/**
 * DELETE /api/storage/[fileId]
 * Delete a file from storage
 * Requires authentication and CSRF token - prevents unauthorized file deletion
 *
 * SECURITY CRITICAL: File deletion without auth = data loss vulnerability
 */
async function deleteFileHandler(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    // Verify CSRF token for destructive operations
    await verifyCsrfToken(request);

    // Require authentication - prevent unauthorized file deletion
    await requireAuthenticatedUser();

    const { fileId } = await params;
    const convex = getConvexHttp();

    // Delete document
    await convex.mutation(api.documents.deleteDocument, {
      documentId: fileId as Id<'files'>,
    });

    return NextResponse.json({ success: true, message: 'Dosya başarıyla silindi' });
  } catch (error) {
    const authError = buildErrorResponse(error);
    if (authError) {
      return NextResponse.json(authError.body, { status: authError.status });
    }

    logger.error('File deletion error', error);
    return NextResponse.json({ success: false, error: 'Dosya silinemedi' }, { status: 500 });
  }
}

// Export handlers with rate limiting
// Next.js 15 requires async params, so we wrap the handlers manually
export async function GET(request: NextRequest, context: { params: Promise<{ fileId: string }> }) {
  // Rate limiting can be added here if needed
  return getFileHandler(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ fileId: string }> }
) {
  // Rate limiting can be added here if needed
  return deleteFileHandler(request, context);
}
