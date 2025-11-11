import { NextRequest, NextResponse } from 'next/server';
import { convexMeetingDecisions } from '@/lib/convex/api';
import logger from '@/lib/logger';
import { Id } from '@/convex/_generated/dataModel';
import { verifyCsrfToken, buildErrorResponse, requireModuleAccess } from '@/lib/api/auth-utils';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireModuleAccess('workflow');

    const decision = await convexMeetingDecisions.get(id as Id<'meeting_decisions'>);
    if (!decision) {
      return NextResponse.json(
        { success: false, error: 'Toplantı kararı bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: decision });
  } catch (_error: unknown) {
    const authError = buildErrorResponse(_error);
    if (authError) {
      return NextResponse.json(authError.body, { status: authError.status });
    }

    const { id } = await params;
    logger.error('Get meeting decision error', _error, {
      endpoint: '/api/meeting-decisions/[id]',
      method: 'GET',
      id,
    });

    return NextResponse.json(
      { success: false, error: 'Toplantı kararı getirilemedi' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let body: Record<string, unknown> | null = null;
  try {
    await verifyCsrfToken(request);
    await requireModuleAccess('workflow');

    body = (await request.json()) as Record<string, unknown>;
    const { id } = await params;

    const response = await convexMeetingDecisions.update(id as Id<'meeting_decisions'>, body);

    return NextResponse.json({
      success: true,
      data: response,
      message: 'Toplantı kararı güncellendi',
    });
  } catch (_error: unknown) {
    const authError = buildErrorResponse(_error);
    if (authError) {
      return NextResponse.json(authError.body, { status: authError.status });
    }

    const { id } = await params;
    logger.error('Update meeting decision error', _error, {
      endpoint: '/api/meeting-decisions/[id]',
      method: 'PUT',
      id,
      payload: body,
    });

    return NextResponse.json(
      { success: false, error: 'Toplantı kararı güncellenemedi' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyCsrfToken(request);
    await requireModuleAccess('workflow');

    const { id } = await params;
    await convexMeetingDecisions.remove(id as Id<'meeting_decisions'>);

    return NextResponse.json({
      success: true,
      message: 'Toplantı kararı silindi',
    });
  } catch (_error: unknown) {
    const authError = buildErrorResponse(_error);
    if (authError) {
      return NextResponse.json(authError.body, { status: authError.status });
    }

    const { id } = await params;
    logger.error('Delete meeting decision error', _error, {
      endpoint: '/api/meeting-decisions/[id]',
      method: 'DELETE',
      id,
    });

    return NextResponse.json(
      { success: false, error: 'Toplantı kararı silinemedi' },
      { status: 500 }
    );
  }
}

