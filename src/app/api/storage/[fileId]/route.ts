import { NextRequest, NextResponse } from 'next/server';
import { getConvexHttp } from '@/lib/convex/server';
import { api } from '@/convex/_generated/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    const convex = getConvexHttp();

    // Get file by storageId using existing query
    const file = await convex.query(api.documents.getFileByStorageId, {
      storageId: fileId as any, // storageId is already an Id type in the query
    });

    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 404 });
    }

    // Redirect to the file URL from Convex storage
    if (!file.url) {
      return NextResponse.json({ error: "Dosya URL'si bulunamadı" }, { status: 500 });
    }
    return NextResponse.redirect(file.url);
  } catch (_error) {
    console.error('File retrieval error:', _error);
    return NextResponse.json({ error: 'Dosya alınamadı' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    const convex = getConvexHttp();

    // Delete document
    await convex.mutation(api.documents.deleteDocument, {
      documentId: fileId as any,
    });

    return NextResponse.json({ success: true });
  } catch (_error) {
    console.error('File deletion error:', _error);
    return NextResponse.json({ error: 'Dosya silinemedi' }, { status: 500 });
  }
}
