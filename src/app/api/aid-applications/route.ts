import { NextRequest, NextResponse } from 'next/server';
import { convexAidApplications, normalizeQueryParams } from '@/lib/convex/api';
import logger from '@/lib/logger';
import { Id } from '@/convex/_generated/dataModel';

function validateApplication(data: Record<string, unknown>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!data.applicant_name || (typeof data.applicant_name === 'string' && data.applicant_name.trim().length < 2)) {
    errors.push('Başvuru sahibi adı zorunludur');
  }
  if (!data.application_date) {
    errors.push('Başvuru tarihi zorunludur');
  }
  if (
    !data.stage ||
    !['draft', 'under_review', 'approved', 'ongoing', 'completed'].includes(data.stage as string)
  ) {
    errors.push('Geçersiz aşama');
  }
  if (!data.status || !['open', 'closed'].includes(data.status as string)) {
    errors.push('Geçersiz durum');
  }
  return { isValid: errors.length === 0, errors };
}

/**
 * GET /api/aid-applications
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params = normalizeQueryParams(searchParams);

  try {
    const response = await convexAidApplications.list({
      ...params,
      stage: searchParams.get('stage') || undefined,
      beneficiary_id: searchParams.get('beneficiary_id') as Id<"beneficiaries"> | undefined,
    });

    return NextResponse.json({
      success: true,
      data: response.documents || [],
      total: response.total || 0,
    });
  } catch (_error: unknown) {
    logger.error('List aid applications error', _error, {
      endpoint: '/api/aid-applications',
      method: 'GET',
      params,
    });
    return NextResponse.json({ success: false, error: 'Veri alınamadı' }, { status: 500 });
  }
}

/**
 * POST /api/aid-applications
 */
async function createApplicationHandler(request: NextRequest) {
  let body: Record<string, unknown> | null = null;
  try {
    body = await request.json() as Record<string, unknown>;
    if (!body) {
      return NextResponse.json({ success: false, error: 'Geçersiz istek verisi' }, { status: 400 });
    }
    const validation = validateApplication(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Doğrulama hatası', details: validation.errors },
        { status: 400 }
      );
    }

    const applicationData = {
      application_date: (body.application_date as string) || new Date().toISOString(),
      applicant_type: (body.applicant_type as 'person' | 'organization' | 'partner') || 'person',
      applicant_name: body.applicant_name as string,
      beneficiary_id: body.beneficiary_id as Id<"beneficiaries"> | undefined,
      one_time_aid: body.one_time_aid as number | undefined,
      regular_financial_aid: body.regular_financial_aid as number | undefined,
      regular_food_aid: body.regular_food_aid as number | undefined,
      in_kind_aid: body.in_kind_aid as number | undefined,
      service_referral: body.service_referral as number | undefined,
      stage: (body.stage as 'draft' | 'under_review' | 'approved' | 'ongoing' | 'completed') || 'draft',
      status: (body.status as 'open' | 'closed') || 'open',
      description: body.description as string | undefined,
      notes: body.notes as string | undefined,
      priority: body.priority as 'low' | 'normal' | 'high' | 'urgent' | undefined,
    };

    const response = await convexAidApplications.create(applicationData);

    return NextResponse.json(
      { success: true, data: response, message: 'Başvuru oluşturuldu' },
      { status: 201 }
    );
  } catch (_error: unknown) {
    logger.error('Create aid application error', _error, {
      endpoint: '/api/aid-applications',
      method: 'POST',
      applicantName: body?.applicant_name,
      stage: body?.stage,
    });
    return NextResponse.json(
      { success: false, error: 'Oluşturma işlemi başarısız' },
      { status: 500 }
    );
  }
}

export const POST = createApplicationHandler;

