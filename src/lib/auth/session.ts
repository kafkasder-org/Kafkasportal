import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import type { Id } from '@/convex/_generated/dataModel';
import { convexHttp } from '@/lib/convex/server';
import { api } from '@/convex/_generated/api';
import { MODULE_PERMISSIONS, SPECIAL_PERMISSIONS, type PermissionValue } from '@/types/permissions';

export interface AuthSession {
  sessionId: string;
  userId: string;
  expire?: string;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role?: string;
  permissions: PermissionValue[];
  isActive: boolean;
  labels?: string[];
}

/**
 * Parse serialized session cookie safely.
 */
export function parseAuthSession(cookieValue?: string): AuthSession | null {
  if (!cookieValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(cookieValue) as AuthSession;
    if (!parsed?.sessionId || !parsed?.userId) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Determine whether the provided session is expired.
 */
export function isSessionExpired(session: AuthSession | null): boolean {
  if (!session?.expire) {
    return false;
  }

  const expireDate = new Date(session.expire);
  return Number.isNaN(expireDate.getTime()) ? false : expireDate.getTime() < Date.now();
}

/**
 * Extract auth-session cookie from a NextRequest.
 */
export function getAuthSessionFromRequest(request: NextRequest): AuthSession | null {
  const cookieValue = request.cookies.get('auth-session')?.value;
  return parseAuthSession(cookieValue);
}

/**
 * Extract auth-session cookie using Next's cookies() helper.
 * Meant for API routes where NextRequest is not directly available.
 */
export async function getAuthSessionFromCookies(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get('auth-session')?.value;
  return parseAuthSession(cookieValue);
}

/**
 * Fetch the authenticated Convex user associated with the session.
 */
export async function getUserFromSession(session: AuthSession | null): Promise<SessionUser | null> {
  if (!session || isSessionExpired(session)) {
    return null;
  }

  // Handle development mock sessions
  if (session.userId.startsWith('mock-')) {
    const baseModulePermissions = Object.values(MODULE_PERMISSIONS);

    const mockUserMap: Record<
      string,
      { email: string; name: string; role: string; permissions: PermissionValue[] }
    > = {
      'mock-admin-1': {
        email: 'admin@test.com',
        name: 'Dernek Başkanı',
        role: 'Dernek Başkanı',
        permissions: [...baseModulePermissions, SPECIAL_PERMISSIONS.USERS_MANAGE],
      },
      'mock-admin-2': {
        email: 'admin@portal.com',
        name: 'Dernek Başkanı',
        role: 'Dernek Başkanı',
        permissions: [...baseModulePermissions, SPECIAL_PERMISSIONS.USERS_MANAGE],
      },
      'mock-manager-1': {
        email: 'manager@test.com',
        name: 'Yönetici Kullanıcı',
        role: 'Yönetici',
        permissions: baseModulePermissions,
      },
      'mock-member-1': {
        email: 'member@test.com',
        name: 'Üye Kullanıcı',
        role: 'Üye',
        permissions: [
          MODULE_PERMISSIONS.BENEFICIARIES,
          MODULE_PERMISSIONS.AID_APPLICATIONS,
          MODULE_PERMISSIONS.MESSAGES,
        ],
      },
      'mock-viewer-1': {
        email: 'viewer@test.com',
        name: 'İzleyici Kullanıcı',
        role: 'Görüntüleyici',
        permissions: [
          MODULE_PERMISSIONS.BENEFICIARIES,
          MODULE_PERMISSIONS.DONATIONS,
          MODULE_PERMISSIONS.REPORTS,
        ],
      },
    };

    const mockUser = mockUserMap[session.userId];
    if (!mockUser) {
      return null;
    }

    return {
      id: session.userId,
      email: mockUser.email,
      name: mockUser.name,
      role: mockUser.role,
      permissions: mockUser.permissions,
      isActive: true,
      labels: [],
    };
  }

  try {
    const user = await convexHttp.query(api.users.get, {
      id: session.userId as Id<'users'>,
    });

    if (!user || !user.isActive) {
      return null;
    }

    const roleString = (user.role || '').toString();
    const roleUpper = roleString.toUpperCase();
    const baseModulePermissions = Object.values(MODULE_PERMISSIONS);

    let effectivePermissions: PermissionValue[] = Array.isArray(user.permissions)
      ? (user.permissions as PermissionValue[])
      : [];

    // Admin-level fallback: if role indicates ADMIN or BAŞKAN, grant base module access and user management
    const looksAdmin = roleUpper.includes('ADMIN') || roleUpper.includes('BAŞKAN');
    if (looksAdmin) {
      const withAdmin = new Set<PermissionValue>([
        ...effectivePermissions,
        ...baseModulePermissions,
        SPECIAL_PERMISSIONS.USERS_MANAGE,
      ]);
      effectivePermissions = Array.from(withAdmin);
    }

    return {
      id: user._id,
      email: user.email || '',
      name: user.name || '',
      role: roleString || 'Personel',
      permissions: effectivePermissions,
      isActive: user.isActive,
      labels: user.labels || [],
    };
  } catch {
    return null;
  }
}

/**
 * Convenience helper to obtain session & user tuple for a request.
 */
export async function getRequestAuthContext(request: NextRequest): Promise<{
  session: AuthSession | null;
  user: SessionUser | null;
}> {
  const session = getAuthSessionFromRequest(request);
  const user = await getUserFromSession(session);
  return { session, user };
}
