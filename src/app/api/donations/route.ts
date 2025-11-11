import { NextRequest, NextResponse } from 'next/server';
import { convexDonations, normalizeQueryParams } from '@/lib/convex/api';
import logger from '@/lib/logger';
import type { DonationDocument, Document } from '@/types/database';
import {
  verifyCsrfToken,
  buildErrorResponse,
  requireModuleAccess,
} from '@/lib/api/auth-utils';

/**
 * Validate donation payload
 */
function validateDonation(data: Partial<DonationDocument>): {
  isValid: boolean;
  errors: string[];
  normalizedData?: Omit<DonationDocument, keyof Document>;
} {
  const errors: string[] = [];

  if (!data.donor_name || data.donor_name.trim().length < 2) {
    errors.push('Bağışçı adı en az 2 karakter olmalıdır');
  }
  if (data.amount === undefined || data.amount === null || Number(data.amount) <= 0) {
    errors.push('Bağış tutarı pozitif olmalıdır');
  }
  if (!data.currency || !['TRY', 'USD', 'EUR'].includes(data.currency)) {
    errors.push('Geçersiz para birimi');
  }
  if (data.donor_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.donor_email)) {
    errors.push('Geçersiz e-posta');
  }
  if (data.donor_phone && !/^[0-9\s\-\+\(\)]{10,15}$/.test(data.donor_phone)) {
    errors.push('Geçersiz telefon numarası');
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // Normalize data with defaults
  const normalizedData = {
    ...data,
    status: (data.status as 'pending' | 'completed' | 'cancelled') || 'pending',
  } as Omit<DonationDocument, keyof Document>;

  return { isValid: true, errors: [], normalizedData };
}

/**
 * GET /api/donations
 * List donations
 */
export async function GET(request: NextRequest) {
  try {
    await requireModuleAccess('donations');

    const { searchParams } = new URL(request.url);
    const params = normalizeQueryParams(searchParams);

    const response = await convexDonations.list({
      ...params,
      donor_email: searchParams.get('donor_email') || undefined,
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

    logger.error('List donations error', _error, {
      endpoint: '/api/donations',
      method: 'GET',
    });
    return NextResponse.json({ success: false, error: 'Veri alınamadı' }, { status: 500 });
  }
}

/**
 * POST /api/donations
 * Create donation
 */
async function createDonationHandler(request: NextRequest) {
  let body: unknown = null;
  try {
    await verifyCsrfToken(request);
    await requireModuleAccess('donations');

    body = await request.json();
    const validation = validateDonation(body as Record<string, unknown>);
    if (!validation.isValid || !validation.normalizedData) {
      return NextResponse.json(
        { success: false, error: 'Doğrulama hatası', details: validation.errors },
        { status: 400 }
      );
    }

    const donationData = {
      donor_name: validation.normalizedData.donor_name || '',
      donor_phone: validation.normalizedData.donor_phone || '',
      donor_email: validation.normalizedData.donor_email,
      amount: validation.normalizedData.amount || 0,
      currency: (validation.normalizedData.currency || 'TRY') as 'TRY' | 'USD' | 'EUR',
      donation_type: validation.normalizedData.donation_type || '',
      payment_method: validation.normalizedData.payment_method || '',
      donation_purpose: validation.normalizedData.donation_purpose || '',
      notes: validation.normalizedData.notes,
      receipt_number: validation.normalizedData.receipt_number || '',
      receipt_file_id: validation.normalizedData.receipt_file_id,
      status: (validation.normalizedData.status || 'pending') as
        | 'pending'
        | 'completed'
        | 'cancelled',
    };

    const response = await convexDonations.create(donationData);

    return NextResponse.json(
      { success: true, data: response, message: 'Bağış başarıyla oluşturuldu' },
      { status: 201 }
    );
  } catch (_error: unknown) {
    const authError = buildErrorResponse(_error);
    if (authError) {
      return NextResponse.json(authError.body, { status: authError.status });
    }

    logger.error('Create donation error', _error, {
      endpoint: '/api/donations',
      method: 'POST',
      donorName: (body as Record<string, unknown>)?.donor_name,
      amount: (body as Record<string, unknown>)?.amount,
    });
    return NextResponse.json(
      { success: false, error: 'Oluşturma işlemi başarısız' },
      { status: 500 }
    );
  }
}

export const POST = createDonationHandler;
