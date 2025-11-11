import { NextRequest, NextResponse } from 'next/server';
import { generateCsrfToken } from '@/lib/csrf';
import { cookies } from 'next/headers';
import { authRateLimit } from '@/lib/rate-limit';
import logger from '@/lib/logger';
import { convexHttp } from '@/lib/convex/server';
import { api } from '@/convex/_generated/api';
import { verifyPassword } from '@/lib/auth/password';

/**
 * POST /api/auth/login
 * Handle user login with Convex authentication
 *
 * Looks up user in Convex users collection and verifies password
 */
export const POST = authRateLimit(async (request: NextRequest) => {
  let email: string | undefined;

  try {
    const body = await request.json();
    email = body.email;
    const { password, rememberMe = false } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email ve şifre gereklidir' },
        { status: 400 }
      );
    }

    // Convex-based authentication
    // Look up user by email in Convex
    const user = await convexHttp.query(api.auth.getUserByEmail, { email: email.toLowerCase() });

    if (!user) {
      logger.warn('Login failed - user not found', {
        email: `${email?.substring(0, 3)}***`,
      });
      return NextResponse.json(
        { success: false, error: 'Geçersiz email veya şifre' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      logger.warn('Login failed - inactive account', {
        email: `${email?.substring(0, 3)}***`,
      });
      return NextResponse.json(
        { success: false, error: 'Hesap aktif değil' },
        { status: 403 }
      );
    }

    // Verify password
    if (!user.passwordHash) {
      logger.warn('Login failed - no password hash', {
        email: `${email?.substring(0, 3)}***`,
      });
      return NextResponse.json(
        { success: false, error: 'Geçersiz email veya şifre' },
        { status: 401 }
      );
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      logger.warn('Login failed - invalid password', {
        email: `${email?.substring(0, 3)}***`,
      });
      return NextResponse.json(
        { success: false, error: 'Geçersiz email veya şifre' },
        { status: 401 }
      );
    }

    const userData = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role || 'Personel',
      permissions: Array.isArray(user.permissions) ? user.permissions : [],
      isActive: user.isActive,
      createdAt: user._creationTime,
      updatedAt: user._creationTime,
      phone: user.phone,
      labels: user.labels ?? [],
    };

    // Generate CSRF token
    const csrfToken = generateCsrfToken();

    // Set session cookies
    const cookieStore = await cookies();
    
    // Create session
    const expireTime = new Date(Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000));
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Session cookie (HttpOnly)
    cookieStore.set(
      'auth-session',
      JSON.stringify({
        sessionId,
        userId: user._id,
        expire: expireTime.toISOString(),
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60,
        path: '/',
      }
    );

    // CSRF token cookie
    cookieStore.set('csrf-token', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60,
      path: '/',
    });

    // Update last login time
    try {
      await convexHttp.mutation(api.auth.updateLastLogin, { userId: user._id });
    } catch (_error) {
      // Log but don't fail login if this fails
      logger.warn('Failed to update last login time', {
        error: _error,
        userId: user._id,
      });
    }

    logger.info('User logged in successfully', {
      userId: user._id,
      email: `${email?.substring(0, 3)}***`,
      role: userData.role,
    });

    return NextResponse.json({
      success: true,
      data: {
        user: userData,
        session: {
          sessionId,
          expire: expireTime.toISOString(),
        },
      },
    });
  } catch (_error: unknown) {
    const errorMessage = _error instanceof Error ? _error.message : 'Giriş yapılırken bir hata oluştu';
    
    logger.error('Login error', _error, {
      endpoint: '/api/auth/login',
      method: 'POST',
      email: `${email?.substring(0, 3)}***`,
    });
    
    // Check for invalid credentials
    if (errorMessage.toLowerCase().includes('invalid') || errorMessage.toLowerCase().includes('credential') || errorMessage.toLowerCase().includes('not found')) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz email veya şifre' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
});
