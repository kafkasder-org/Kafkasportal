import { NextRequest, NextResponse } from 'next/server';
import { convexUsers } from '@/lib/convex/api';
import logger from '@/lib/logger';
import { hashPassword, validatePasswordStrength } from '@/lib/auth/password';
import {
  requireAuthenticatedUser,
  verifyCsrfToken,
  buildErrorResponse,
} from '@/lib/api/auth-utils';
import { ALL_PERMISSIONS, type PermissionValue } from '@/types/permissions';
import { InputSanitizer } from '@/lib/security';

const PERMISSION_SET = new Set(ALL_PERMISSIONS);

interface NormalizedUserPayload {
  name: string;
  email: string;
  role: string;
  permissions: PermissionValue[];
  isActive: boolean;
  phone?: string;
  avatar?: string;
  labels?: string[];
  password?: string;
}

const normalizeUserPayload = (
  payload: Record<string, unknown>,
  { requirePassword }: { requirePassword: boolean }
): { valid: boolean; errors: string[]; data?: NormalizedUserPayload } => {
  const errors: string[] = [];

  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  if (name.length < 2) {
    errors.push('Ad Soyad en az 2 karakter olmalıdır');
  }

  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
  if (!InputSanitizer.validateEmail(email)) {
    errors.push('Geçerli bir e-posta zorunludur');
  }

  const role = typeof payload.role === 'string' ? payload.role.trim() : '';
  if (role.length < 2) {
    errors.push('Rol bilgisi en az 2 karakter olmalıdır');
  }

  const permissions =
    Array.isArray(payload.permissions) && payload.permissions.every((item) => typeof item === 'string')
      ? (Array.from(
          new Set(payload.permissions.filter((permission) => PERMISSION_SET.has(permission as PermissionValue)))
        ) as PermissionValue[])
      : [];

  if (!permissions.length) {
    errors.push('En az bir modül erişimi seçilmelidir');
  }

  const isActive =
    typeof payload.isActive === 'boolean'
      ? payload.isActive
      : payload.isActive === 'false'
      ? false
      : true;

  const phone =
    typeof payload.phone === 'string' && payload.phone.trim().length > 0
      ? payload.phone.trim()
      : undefined;

  const password =
    typeof payload.password === 'string' && payload.password.trim().length > 0
      ? payload.password.trim()
      : undefined;

  if (requirePassword && !password) {
    errors.push('Şifre zorunludur');
  }

  const avatar = typeof payload.avatar === 'string' ? payload.avatar : undefined;
  const labels = Array.isArray(payload.labels)
    ? payload.labels.filter((item): item is string => typeof item === 'string')
    : undefined;

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: {
      name,
      email,
      role,
      permissions,
      isActive,
      phone,
      avatar,
      labels,
      password,
    },
  };
};

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuthenticatedUser();
    if (!user.permissions.includes('users:manage')) {
      return NextResponse.json(
        { success: false, error: 'Bu işlemi gerçekleştirmek için yetkiniz yok' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') ?? undefined;
    const role = searchParams.get('role') ?? undefined;
    const isActiveParam = searchParams.get('isActive');
    const limitParam = searchParams.get('limit');

    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 100) : 50;
    const isActive =
      isActiveParam === null ? undefined : isActiveParam === 'true' ? true : isActiveParam === 'false' ? false : undefined;

    const response = await convexUsers.list({
      search,
      role: role && role.length > 0 ? role : undefined,
      isActive,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: response?.documents ?? [],
      total: response?.total ?? 0,
      continueCursor: response?.continueCursor ?? null,
      isDone: response?.isDone ?? true,
    });
  } catch (error: unknown) {
    const authError = buildErrorResponse(error);
    if (authError) {
      return NextResponse.json(authError.body, { status: authError.status });
    }

    logger.error('List users error', error, {
      endpoint: '/api/users',
      method: 'GET',
    });
    return NextResponse.json({ success: false, error: 'Veri alınamadı' }, { status: 500 });
  }
}

async function createUserHandler(request: NextRequest) {
  let body: unknown = null;
  try {
    await verifyCsrfToken(request);
    const { user } = await requireAuthenticatedUser();
    if (!user.permissions.includes('users:manage')) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı oluşturma yetkiniz bulunmuyor' },
        { status: 403 }
      );
    }

    body = await request.json();
    const validation = normalizeUserPayload(body as Record<string, unknown>, { requirePassword: true });
    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        { success: false, error: 'Doğrulama hatası', details: validation.errors },
        { status: 400 }
      );
    }

    const passwordValidation = validatePasswordStrength(validation.data.password as string);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { success: false, error: passwordValidation.error || 'Şifre yeterince güçlü değil' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(validation.data.password as string);

    const response = await convexUsers.create({
      name: validation.data.name,
      email: validation.data.email,
      role: validation.data.role,
      permissions: validation.data.permissions,
      passwordHash,
      isActive: validation.data.isActive,
      phone: validation.data.phone,
      avatar: validation.data.avatar,
      labels: validation.data.labels,
    });

    return NextResponse.json(
      { success: true, data: response, message: 'Kullanıcı oluşturuldu' },
      { status: 201 }
    );
  } catch (error: unknown) {
    const authError = buildErrorResponse(error);
    if (authError) {
      return NextResponse.json(authError.body, { status: authError.status });
    }

    logger.error('Create user error', error, {
      endpoint: '/api/users',
      method: 'POST',
      email: (body as Record<string, unknown>)?.email,
    });

    const message = error instanceof Error ? error.message : '';
    if (message.includes('already') || message.includes('kullanılıyor')) {
      return NextResponse.json(
        { success: false, error: 'Bu e-posta adresi zaten kayıtlı' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Kullanıcı oluşturulamadı' },
      { status: 500 }
    );
  }
}

export const POST = createUserHandler;

