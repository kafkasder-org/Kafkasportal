import { NextRequest, NextResponse } from 'next/server';
import { convexMeetings, normalizeQueryParams } from '@/lib/convex/api';
import logger from '@/lib/logger';
import { Id } from '@/convex/_generated/dataModel';
import { verifyCsrfToken, buildErrorResponse, requireModuleAccess } from '@/lib/api/auth-utils';

function validateMeeting(data: Record<string, unknown>): {
  isValid: boolean;
  errors: string[];
  normalizedData?: Record<string, unknown>;
} {
  const errors: string[] = [];
  if (!data.title || (typeof data.title === 'string' && data.title.trim().length < 3)) {
    errors.push('Toplantı başlığı en az 3 karakter olmalıdır');
  }
  if (!data.meeting_date) {
    errors.push('Toplantı tarihi zorunludur');
  }
  if (
    data.status &&
    !['scheduled', 'ongoing', 'completed', 'cancelled'].includes(data.status as string)
  ) {
    errors.push('Geçersiz durum');
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  const normalizedData = {
    ...data,
    status: (data.status as string) || 'scheduled',
  };

  return { isValid: true, errors: [], normalizedData };
}

/**
 * GET /api/meetings
 */
export async function GET(request: NextRequest) {
  try {
    await requireModuleAccess('workflow');

    const { searchParams } = new URL(request.url);
    const params = normalizeQueryParams(searchParams);

    const response = await convexMeetings.list({
      ...params,
      organizer: searchParams.get('organizer') as Id<'users'> | undefined,
    });

    return NextResponse.json({
      success: true,
      data: response.documents || [],
      total: response.total || 0,
    });
  } catch (_error: unknown) {
    const authError = buildErrorResponse(_error);
    if (authError) {
      return NextResponse.json(authError.body, { status: authError.status });
    }

    logger.error('List meetings error', _error, {
      endpoint: '/api/meetings',
      method: 'GET',
    });
    return NextResponse.json({ success: false, error: 'Veri alınamadı' }, { status: 500 });
  }
}

/**
 * POST /api/meetings
 */
async function createMeetingHandler(request: NextRequest) {
  let body: unknown = null;
  try {
    await verifyCsrfToken(request);
    await requireModuleAccess('workflow');

    body = await request.json();
    const validation = validateMeeting(body as Record<string, unknown>);
    if (!validation.isValid || !validation.normalizedData) {
      return NextResponse.json(
        { success: false, error: 'Doğrulama hatası', details: validation.errors },
        { status: 400 }
      );
    }

    const meetingData = {
      title: validation.normalizedData.title as string,
      description: validation.normalizedData.description as string | undefined,
      meeting_date: validation.normalizedData.meeting_date as string,
      location: validation.normalizedData.location as string | undefined,
      organizer: validation.normalizedData.organizer as Id<'users'>,
      participants: (validation.normalizedData.participants as Id<'users'>[]) || [],
      status: (validation.normalizedData.status || 'scheduled') as
        | 'scheduled'
        | 'ongoing'
        | 'completed'
        | 'cancelled',
      meeting_type: (validation.normalizedData.meeting_type || 'general') as
        | 'general'
        | 'committee'
        | 'board'
        | 'other',
      agenda: validation.normalizedData.agenda as string | undefined,
      notes: validation.normalizedData.notes as string | undefined,
    };

    const response = await convexMeetings.create(meetingData);

    return NextResponse.json(
      { success: true, data: response, message: 'Toplantı başarıyla oluşturuldu' },
      { status: 201 }
    );
  } catch (_error: unknown) {
    const authError = buildErrorResponse(_error);
    if (authError) {
      return NextResponse.json(authError.body, { status: authError.status });
    }

    logger.error('Create meeting error', _error, {
      endpoint: '/api/meetings',
      method: 'POST',
      title: (body as Record<string, unknown>)?.title,
      meetingDate: (body as Record<string, unknown>)?.meeting_date,
    });
    return NextResponse.json(
      { success: false, error: 'Oluşturma işlemi başarısız' },
      { status: 500 }
    );
  }
}

export const POST = createMeetingHandler;
