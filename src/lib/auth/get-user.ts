import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { convexHttp } from '@/lib/convex/server';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

/**
 * Get current user ID from auth session
 * Use this in API routes to get the authenticated user ID
 * @param request - NextRequest object (optional, will use cookies() if not provided)
 * @returns User ID or null if not authenticated
 */
export async function getCurrentUserId(request?: NextRequest): Promise<Id<'users'> | null> {
  try {
    let sessionCookie: string | undefined;

    if (request) {
      // Use request cookies if provided
      sessionCookie = request.cookies.get('auth-session')?.value;
    } else {
      // Use server-side cookies() function
      const cookieStore = await cookies();
      sessionCookie = cookieStore.get('auth-session')?.value;
    }

    if (!sessionCookie) {
      return null;
    }

    const sessionData = JSON.parse(sessionCookie);

    if (!sessionData.userId) {
      return null;
    }

    // Validate session expiration
    if (sessionData.expire) {
      const expireDate = new Date(sessionData.expire);
      if (expireDate < new Date()) {
        return null;
      }
    }

    return sessionData.userId as Id<'users'>;
  } catch (_error) {
    return null;
  }
}

/**
 * Get current user data from auth session
 * @param request - NextRequest object (optional)
 * @returns User object or null if not authenticated
 */
export async function getCurrentUser(request?: NextRequest) {
  const userId = await getCurrentUserId(request);
  
  if (!userId) {
    return null;
  }

  try {
    // Fetch user from Convex
    const user = await convexHttp.query(api.users.get, { id: userId });
    return user;
  } catch (_error) {
    return null;
  }
}

