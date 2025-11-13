import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const isPublic =
    pathname.startsWith('/login') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/assets');

  if (isPublic) {
    return NextResponse.next();
  }

  const raw = req.cookies.get('auth-session')?.value || '';
  if (!raw) {
    const redirectUrl = new URL('/login', req.url);
    if (pathname !== '/login') {
      const target = pathname + (search || '');
      redirectUrl.searchParams.set('redirect', target);
    }
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const session = JSON.parse(raw) as { expire?: string };
    if (!session?.expire || new Date(session.expire) <= new Date()) {
      const redirectUrl = new URL('/login', req.url);
      if (pathname !== '/login') {
        const target = pathname + (search || '');
        redirectUrl.searchParams.set('redirect', target);
      }
      return NextResponse.redirect(redirectUrl);
    }
  } catch {
    const redirectUrl = new URL('/login', req.url);
    if (pathname !== '/login') {
      const target = pathname + (search || '');
      redirectUrl.searchParams.set('redirect', target);
    }
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|favicon.ico|login).*)'],
};
