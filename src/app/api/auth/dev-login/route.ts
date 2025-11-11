import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { generateCsrfToken } from '@/lib/csrf';
import logger from '@/lib/logger';

/**
 * GET /api/auth/dev-login
 * Development-only helper to set a mock session cookie and optionally redirect.
 * Usage: /api/auth/dev-login?user=mock-admin-1&redirect=/genel
 */
export async function GET(request: NextRequest) {
  try {
    // Normalize environment check to avoid TS union comparison warnings
    const isProduction = (process.env.NODE_ENV as string) === 'production';

    if (isProduction) {
      return NextResponse.json(
        { success: false, error: 'Dev login üretimde kapalı' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const user = url.searchParams.get('user') || 'mock-admin-1';
    const redirect = url.searchParams.get('redirect') || '/';

    const allowedUsers = new Set([
      'mock-admin-1',
      'mock-admin-2',
      'mock-manager-1',
      'mock-member-1',
      'mock-viewer-1',
    ]);

    if (!allowedUsers.has(user)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz mock kullanıcı' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();

    const expireTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 saat
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Session cookie (HttpOnly)
    cookieStore.set(
      'auth-session',
      JSON.stringify({
        sessionId,
        userId: user,
        expire: expireTime.toISOString(),
      }),
      {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60,
        path: '/',
      }
    );

    // CSRF token cookie (client-readable)
    const csrfToken = generateCsrfToken();
    cookieStore.set('csrf-token', csrfToken, {
      httpOnly: false,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60,
      path: '/',
    });

    logger.info('Dev mock login set', {
      user,
      sessionId,
      redirect,
    });

    // Redirect if requested
    if (redirect) {
      const redirectUrl = new URL(redirect, request.url);
      return NextResponse.redirect(redirectUrl, { status: 302 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Dev login error', error, {
      endpoint: '/api/auth/dev-login',
      method: 'GET',
    });
    return NextResponse.json({ success: false, error: 'Beklenmeyen hata' }, { status: 500 });
  }
}
