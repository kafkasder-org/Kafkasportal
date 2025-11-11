import { NextRequest, NextResponse } from 'next/server';
import { convexBeneficiaries, normalizeQueryParams } from '@/lib/convex/api';
import logger from '@/lib/logger';
import type { QueryParams } from '@/types/database';
import {
  verifyCsrfToken,
  buildErrorResponse,
  requireModuleAccess,
} from '@/lib/api/auth-utils';

// TypeScript interfaces
interface BeneficiaryFilters {
  status?: string;
  priority?: string;
  category?: string;
  city?: string;
}

interface _ParsedQueryParams extends Omit<QueryParams, 'filters'> {
  filters?: BeneficiaryFilters;
}

interface BeneficiaryData {
  name?: string;
  tc_no?: string;
  phone?: string;
  address?: string;
  email?: string;
  status?: string;
  city?: string;
  district?: string;
  neighborhood?: string;
  family_size?: number;
  [key: string]: unknown;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate beneficiary data
 */
function validateBeneficiaryData(data: BeneficiaryData): ValidationResult {
  const errors: string[] = [];

  // Required fields
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Ad Soyad en az 2 karakter olmalıdır');
  }

  if (!data.tc_no || !/^\d{11}$/.test(data.tc_no)) {
    errors.push('TC Kimlik No 11 haneli olmalıdır');
  }

  if (!data.phone || !/^[0-9\s\-\+\(\)]{10,15}$/.test(data.phone)) {
    errors.push('Geçerli bir telefon numarası giriniz');
  }

  if (!data.address || data.address.trim().length < 10) {
    errors.push('Adres en az 10 karakter olmalıdır');
  }

  // Email validation (optional but if provided must be valid)
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Geçerli bir email adresi giriniz');
  }

  // Status validation
  if (data.status && !['TASLAK', 'AKTIF', 'PASIF', 'SILINDI'].includes(data.status)) {
    errors.push('Geçersiz durum değeri');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * GET /api/beneficiaries
 * List beneficiaries with pagination and filters
 */
async function getBeneficiariesHandler(request: NextRequest) {
  try {
    await requireModuleAccess('beneficiaries');

    const { searchParams } = new URL(request.url);
    const params = normalizeQueryParams(searchParams);

    const response = await convexBeneficiaries.list({
      ...params,
      city: searchParams.get('city') || undefined,
    });

    const beneficiaries = response.documents || [];
    const total = response.total || 0;

    return NextResponse.json({
      success: true,
      data: beneficiaries,
      total,
      message: `${total} kayıt bulundu`,
    });
  } catch (_error: unknown) {
    const authError = buildErrorResponse(_error);
    if (authError) {
      return NextResponse.json(authError.body, { status: authError.status });
    }

    logger.error('Beneficiaries list error', _error, {
      endpoint: '/api/beneficiaries',
      method: 'GET',
    });

    return NextResponse.json(
      { success: false, error: 'Listeleme işlemi başarısız' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/beneficiaries
 * Create new beneficiary
 */
async function createBeneficiaryHandler(request: NextRequest) {
  let body: BeneficiaryData | null = null;
  try {
    await verifyCsrfToken(request);
    const { user } = await requireModuleAccess('beneficiaries');

    body = (await request.json()) as BeneficiaryData;

    // Validate input
    if (!body) {
      return NextResponse.json({ success: false, error: 'Veri bulunamadı' }, { status: 400 });
    }

    // Validate beneficiary data
    const validation = validateBeneficiaryData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Doğrulama hatası', details: validation.errors },
        { status: 400 }
      );
    }

    // Prepare Convex mutation data
    const beneficiaryData = {
      name: body.name || '',
      tc_no: body.tc_no || '',
      phone: body.phone || '',
      address: body.address || '',
      city: body.city || '',
      district: body.district || '',
      neighborhood: body.neighborhood || '',
      family_size: body.family_size || 1,
      status: (body.status as 'TASLAK' | 'AKTIF' | 'PASIF' | 'SILINDI') || ('TASLAK' as const),
      email: body.email,
      birth_date: body.birth_date,
      gender: body.gender,
      nationality: body.nationality,
      religion: body.religion,
      marital_status: body.marital_status,
      children_count: body.children_count,
      orphan_children_count: body.orphan_children_count,
      elderly_count: body.elderly_count,
      disabled_count: body.disabled_count,
      income_level: body.income_level,
      income_source: body.income_source,
      has_debt: body.has_debt,
      housing_type: body.housing_type,
      has_vehicle: body.has_vehicle,
      health_status: body.health_status,
      has_chronic_illness: body.has_chronic_illness,
      chronic_illness_detail: body.chronic_illness_detail,
      has_disability: body.has_disability,
      disability_detail: body.disability_detail,
      has_health_insurance: body.has_health_insurance,
      regular_medication: body.regular_medication,
      education_level: body.education_level,
      occupation: body.occupation,
      employment_status: body.employment_status,
      aid_type: body.aid_type,
      totalAidAmount: body.totalAidAmount,
      aid_duration: body.aid_duration,
      priority: body.priority,
      reference_name: body.reference_name,
      reference_phone: body.reference_phone,
      reference_relation: body.reference_relation,
      application_source: body.application_source,
      notes: body.notes,
      previous_aid: body.previous_aid,
      other_organization_aid: body.other_organization_aid,
      emergency: body.emergency,
      contact_preference: body.contact_preference,
      approval_status: body.approval_status as 'pending' | 'approved' | 'rejected' | undefined,
      approved_by: body.approved_by,
      approved_at: body.approved_at,
    };

    const response = await convexBeneficiaries.create(beneficiaryData, {
      auth: { userId: user.id, role: user.role ?? 'Personel' },
    });

    return NextResponse.json(
      {
        success: true,
        data: response,
        message: 'İhtiyaç sahibi başarıyla oluşturuldu',
      },
      { status: 201 }
    );
  } catch (_error: unknown) {
    const authError = buildErrorResponse(_error);
    if (authError) {
      return NextResponse.json(authError.body, { status: authError.status });
    }

    logger.error('Beneficiary creation error', _error, {
      endpoint: '/api/beneficiaries',
      method: 'POST',
      tcNo: `${body?.tc_no?.substring(0, 3)}***`, // Mask TC number for privacy
    });

    // Handle duplicate TC number
    const errorMessage = _error instanceof Error ? _error.message : '';
    if (errorMessage?.includes('already exists') || errorMessage?.includes('duplicate')) {
      return NextResponse.json(
        { success: false, error: 'Bu TC Kimlik No zaten kayıtlı' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Oluşturma işlemi başarısız' },
      { status: 500 }
    );
  }
}

// Export handlers with CSRF protection
export const GET = getBeneficiariesHandler;
export const POST = createBeneficiaryHandler;
