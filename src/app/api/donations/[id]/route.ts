import { NextRequest, NextResponse } from 'next/server';
import { convexDonations } from '@/lib/convex/api';
import { extractParams } from '@/lib/api/route-helpers';
import logger from '@/lib/logger';
import { Id } from '@/convex/_generated/dataModel';
import { verifyCsrfToken, buildErrorResponse, requireModuleAccess } from '@/lib/api/auth-utils';

function validateDonationUpdate(data: Record<string, unknown>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (data.amount !== undefined && Number(data.amount) <= 0) {
    errors.push('Bağış tutarı pozitif olmalıdır');
  }
  if (data.currency && !['TRY', 'USD', 'EUR'].includes(data.currency as string)) {
    errors.push('Geçersiz para birimi');
  }
  if (
    data.donor_email &&
    typeof data.donor_email === 'string' &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.donor_email)
  ) {
    errors.push('Geçersiz e-posta');
  }
  if (
    data.donor_phone &&
    typeof data.donor_phone === 'string' &&
    !/^[0-9\s\-\+\(\)]{10,15}$/.test(data.donor_phone)
  ) {
    errors.push('Geçersiz telefon numarası');
  }
  if (data.status && !['pending', 'completed', 'cancelled'].includes(data.status as string)) {
    errors.push('Geçersiz durum');
  }
  return { isValid: errors.length === 0, errors };
}

/**
 * GET /api/donations/[id]
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await extractParams(params);

  // Handle special "stats" route - redirect to stats endpoint if it exists
  if (id === 'stats') {
    return NextResponse.json(
      { success: false, error: 'Stats endpoint için /api/donations/stats kullanın' },
      { status: 404 }
    );
  }

  try {
    await requireModuleAccess('donations');

    const donation = await convexDonations.get(id as Id<'donations'>);

    if (!donation) {
      return NextResponse.json({ success: false, error: 'Bağış bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: donation,
    });
  } catch (_error) {
    const authError = buildErrorResponse(_error);
    if (authError) {
      return NextResponse.json(authError.body, { status: authError.status });
    }

    logger.error('Get donation error', _error, {
      endpoint: '/api/donations/[id]',
      method: 'GET',
      donationId: id,
    });
    return NextResponse.json({ success: false, _error: 'Veri alınamadı' }, { status: 500 });
  }
}

/**
 * PUT /api/donations/[id]
 */
async function updateDonationHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await extractParams(params);
  try {
    await verifyCsrfToken(request);
    await requireModuleAccess('donations');

    const body = (await request.json()) as Record<string, unknown>;

    const validation = validateDonationUpdate(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Doğrulama hatası', details: validation.errors },
        { status: 400 }
      );
    }

    const donationData: Parameters<typeof convexDonations.update>[1] = {
      status: body.status as 'pending' | 'completed' | 'cancelled' | undefined,
      amount: body.amount as number | undefined,
      notes: body.notes as string | undefined,
    };

    const updated = await convexDonations.update(id as Id<'donations'>, donationData);

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Bağış başarıyla güncellendi',
    });
  } catch (_error) {
    const authError = buildErrorResponse(_error);
    if (authError) {
      return NextResponse.json(authError.body, { status: authError.status });
    }

    logger.error('Update donation error', _error, {
      endpoint: '/api/donations/[id]',
      method: 'PUT',
      donationId: id,
    });

    const errorMessage = _error instanceof Error ? _error.message : '';
    if (errorMessage?.includes('not found')) {
      return NextResponse.json({ success: false, _error: 'Bağış bulunamadı' }, { status: 404 });
    }

    return NextResponse.json(
      { success: false, _error: 'Güncelleme işlemi başarısız' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/donations/[id]
 */
async function deleteDonationHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await extractParams(params);
  try {
    await verifyCsrfToken(request);
    await requireModuleAccess('donations');

    await convexDonations.remove(id as Id<'donations'>);

    return NextResponse.json({
      success: true,
      message: 'Bağış başarıyla silindi',
    });
  } catch (_error) {
    const authError = buildErrorResponse(_error);
    if (authError) {
      return NextResponse.json(authError.body, { status: authError.status });
    }

    logger.error('Delete donation error', _error, {
      endpoint: '/api/donations/[id]',
      method: 'DELETE',
      donationId: id,
    });

    const errorMessage = _error instanceof Error ? _error.message : '';
    if (errorMessage?.includes('not found')) {
      return NextResponse.json({ success: false, _error: 'Bağış bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ success: false, _error: 'Silme işlemi başarısız' }, { status: 500 });
  }
}

export const PUT = updateDonationHandler;
export const DELETE = deleteDonationHandler;
