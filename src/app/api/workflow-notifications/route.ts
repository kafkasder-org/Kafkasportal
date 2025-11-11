import { NextRequest, NextResponse } from 'next/server';
import { convexWorkflowNotifications, normalizeQueryParams } from '@/lib/convex/api';
import { Id } from '@/convex/_generated/dataModel';
import logger from '@/lib/logger';
import { verifyCsrfToken, buildErrorResponse, requireModuleAccess } from '@/lib/api/auth-utils';

type NotificationStatus = 'beklemede' | 'gonderildi' | 'okundu';
type NotificationCategory = 'meeting' | 'gorev' | 'rapor' | 'hatirlatma';

function validateNotification(data: Record<string, unknown>) {
  const errors: string[] = [];

  if (!data.recipient) {
    errors.push('Alıcı zorunludur');
  }

  if (!data.title || (typeof data.title === 'string' && data.title.trim().length < 3)) {
    errors.push('Bildirim başlığı en az 3 karakter olmalıdır');
  }

  if (
    data.category &&
    !['meeting', 'gorev', 'rapor', 'hatirlatma'].includes(data.category as string)
  ) {
    errors.push('Geçersiz bildirim kategorisi');
  }

  if (
    data.status &&
    !['beklemede', 'gonderildi', 'okundu'].includes(data.status as string)
  ) {
    errors.push('Geçersiz bildirim durumu');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export async function GET(request: NextRequest) {
  try {
    await requireModuleAccess('workflow');

    const { searchParams } = new URL(request.url);
    const params = normalizeQueryParams(searchParams);

    const recipient = searchParams.get('recipient') as Id<'users'> | undefined;
    const status = searchParams.get('status') as NotificationStatus | undefined;
    const category = searchParams.get('category') as NotificationCategory | undefined;

    const response = await convexWorkflowNotifications.list({
      ...(params as Record<string, unknown>),
      recipient,
      status,
      category,
    });

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (_error: unknown) {
    const authError = buildErrorResponse(_error);
    if (authError) {
      return NextResponse.json(authError.body, { status: authError.status });
    }

    logger.error('List workflow notifications error', _error, {
      endpoint: '/api/workflow-notifications',
      method: 'GET',
    });

    return NextResponse.json(
      { success: false, error: 'Bildirimler alınamadı' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown> | null = null;
  try {
    await verifyCsrfToken(request);
    await requireModuleAccess('workflow');

    body = (await request.json()) as Record<string, unknown>;

    const validation = validateNotification(body);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Doğrulama hatası',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const response = await convexWorkflowNotifications.create({
      recipient: body.recipient,
      triggered_by: body.triggered_by,
      category: (body.category as NotificationCategory) ?? 'meeting',
      title: body.title,
      body: body.body,
      status: (body.status as NotificationStatus) ?? 'beklemede',
      reference: body.reference,
      metadata: body.metadata,
      created_at: body.created_at,
    });

    return NextResponse.json(
      {
        success: true,
        data: response,
        message: 'Bildirim oluşturuldu',
      },
      { status: 201 }
    );
  } catch (_error: unknown) {
    const authError = buildErrorResponse(_error);
    if (authError) {
      return NextResponse.json(authError.body, { status: authError.status });
    }

    logger.error('Create workflow notification error', _error, {
      endpoint: '/api/workflow-notifications',
      method: 'POST',
      payload: body,
    });

    return NextResponse.json(
      { success: false, error: 'Bildirim oluşturulamadı' },
      { status: 500 }
    );
  }
}

