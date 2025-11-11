import { NextRequest, NextResponse } from 'next/server';
import { getConvexHttp } from '@/lib/convex/server';
import { api } from '@/convex/_generated/api';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string || 'documents';
    const beneficiaryId = formData.get('beneficiaryId') as string;
    const documentType = formData.get('documentType') as string || 'other';

    if (!file) {
      return NextResponse.json(
        { error: 'Dosya bulunamadı' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Dosya boyutu çok büyük. Maksimum 10MB olabilir.' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Desteklenmeyen dosya türü. Sadece resim ve PDF dosyaları kabul edilir.' },
        { status: 400 }
      );
    }

    // Get Convex client
    const convex = getConvexHttp();

    // Generate upload URL
    const uploadUrl = await convex.mutation(api.documents.generateUploadUrl, {});

    // Upload file to Convex storage
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': file.type },
      body: await file.arrayBuffer(),
    });

    if (!uploadResponse.ok) {
      throw new Error('Dosya yükleme başarısız');
    }

    // Get storage ID from response
    // Convex storage returns the storage ID as a JSON string
    const storageId = await uploadResponse.json();

    // Create document metadata
    if (beneficiaryId) {
      await convex.mutation(api.documents.createDocument, {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        bucket,
        storageId: storageId as any,
        beneficiaryId: beneficiaryId as any,
        documentType,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        fileId: storageId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      },
    });
  } catch (_error) {
    console.error('File upload error:', _error);
    return NextResponse.json(
      { error: _error instanceof Error ? _error.message : 'Dosya yükleme hatası' },
      { status: 500 }
    );
  }
}

