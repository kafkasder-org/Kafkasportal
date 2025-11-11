import { NextRequest, NextResponse } from 'next/server';
import { convexMeetingActionItems, normalizeQueryParams } from '@/lib/convex/api';
import { Id } from '@/convex/_generated/dataModel';
import logger from '@/lib/logger';
import { verifyCsrfToken, buildErrorResponse, requireModuleAccess } from '@/lib/api/auth-utils';

type ActionStatus = 'beklemede' | 'devam' | 'hazir' | 'iptal';

function validateActionItem(data: Record<string, unknown>) {
  const errors: string[] = [];

  if (!data.meeting_id) {
    errors.push('Toplantı ID zorunludur');
  }

  if (!data.title || (typeof data.title === 'string' && data.title.trim().length < 3)) {
    errors.push('Görev başlığı en az 3 karakter olmalıdır');
  }

  if (!data.assigned_to) {
    errors.push('Sorumlu kişi seçilmelidir');
  }

  if (!data.created_by) {
    errors.push('Oluşturan kullanıcı zorunludur');
  }

  if (
    data.status &&
    !['beklemede', 'devam', 'hazir', 'iptal'].includes(data.status as string)
  ) {
    errors.push('Geçersiz görev durumu');
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

    const meeting_id = searchParams.get('meeting_id') as Id<'meetings'> | undefined;
    const assigned_to = searchParams.get('assigned_to') as Id<'users'> | undefined;
    const status = searchParams.get('status') as ActionStatus | undefined;

    const response = await convexMeetingActionItems.list({
      ...(params as Record<string, unknown>),
      meeting_id,
      assigned_to,
      status,
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

    logger.error('List meeting action items error', _error, {
      endpoint: '/api/meeting-action-items',
      method: 'GET',
    });

    return NextResponse.json(
      { success: false, error: 'Toplantı görevleri alınamadı' },
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

    const validation = validateActionItem(body);
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

    const response = await convexMeetingActionItems.create({
      meeting_id: body.meeting_id,
      decision_id: body.decision_id,
      title: body.title,
      description: body.description,
      assigned_to: body.assigned_to,
      created_by: body.created_by,
      status: (body.status as ActionStatus) ?? 'beklemede',
      due_date: body.due_date,
      notes: body.notes,
      reminder_scheduled_at: body.reminder_scheduled_at,
    });

    return NextResponse.json(
      {
        success: true,
        data: response,
        message: 'Toplantı görevi oluşturuldu',
      },
      { status: 201 }
    );
  } catch (_error: unknown) {
    const authError = buildErrorResponse(_error);
    if (authError) {
      return NextResponse.json(authError.body, { status: authError.status });
    }

    logger.error('Create meeting action item error', _error, {
      endpoint: '/api/meeting-action-items',
      method: 'POST',
      payload: body,
    });

    return NextResponse.json(
      { success: false, error: 'Toplantı görevi oluşturulamadı' },
      { status: 500 }
    );
  }
}

