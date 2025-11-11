import { NextRequest, NextResponse } from 'next/server';
import { RateLimiter } from './security';

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse> | NextResponse,
  options: RateLimitOptions = { maxRequests: 100, windowMs: 15 * 60 * 1000 } // 100 requests per 15 minutes
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    // Get client identifier (IP address)
    const clientIP =
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      req.headers.get('x-client-ip') ||
      'unknown';

    // Extract user info if available (for authenticated requests)
    const authHeader = req.headers.get('authorization');
    const isAuthenticated = !!authHeader;
    const userId = req.headers.get('x-user-id') || undefined;

    const identifier = `${clientIP}-${req.method}-${req.nextUrl.pathname}`;

    // Check rate limit with new API
    const rateLimitResult = RateLimiter.checkLimit(
      identifier,
      options.maxRequests,
      options.windowMs,
      userId,
      isAuthenticated
    );

    if (!rateLimitResult.allowed) {
      const remainingTime = Math.ceil(rateLimitResult.resetTime - Date.now()) / 1000;

      // Log rate limit violation (handled internally in checkLimit)

      return new NextResponse(
        JSON.stringify({
          error: 'Çok fazla istek gönderdiniz. Lütfen biraz bekleyin.',
          retryAfter: remainingTime,
          code: 'RATE_LIMIT_EXCEEDED',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': remainingTime.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
          },
        }
      );
    }

    try {
      const response = await handler(req);

      // Skip rate limit counting for successful requests if configured
      if (options.skipSuccessfulRequests && response.status < 400) {
        RateLimiter.reset(identifier);
      }

      // Skip rate limit counting for failed requests if configured
      if (options.skipFailedRequests && response.status >= 400) {
        RateLimiter.reset(identifier);
      }

      // Add rate limit headers
      response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
      response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());

      return response;
    } catch (error) {
      // Skip rate limit counting for failed requests if configured
      if (options.skipFailedRequests) {
        RateLimiter.reset(identifier);
      }

      throw error;
    }
  };
}

// Pre-configured rate limiters for different endpoints
export const authRateLimit = (
  handler: (req: NextRequest) => Promise<NextResponse> | NextResponse
) =>
  withRateLimit(handler, {
    maxRequests: parseInt(process.env.RATE_LIMIT_AUTH_MAX || '10'),
    windowMs: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW || '600000'), // 10 attempts per 10 minutes
    skipSuccessfulRequests: true,
    skipFailedRequests: true, // Don't count failed login attempts
  });

export const dataModificationRateLimit = (
  handler: (req: NextRequest) => Promise<NextResponse> | NextResponse
) =>
  withRateLimit(handler, {
    maxRequests: parseInt(process.env.RATE_LIMIT_DATA_MODIFY_MAX || '50'),
    windowMs: parseInt(process.env.RATE_LIMIT_DATA_MODIFY_WINDOW || '900000'), // 50 requests per 15 minutes
  });

export const readOnlyRateLimit = (
  handler: (req: NextRequest) => Promise<NextResponse> | NextResponse
) =>
  withRateLimit(handler, {
    maxRequests: parseInt(process.env.RATE_LIMIT_READ_MAX || '200'),
    windowMs: parseInt(process.env.RATE_LIMIT_READ_WINDOW || '900000'), // 200 requests per 15 minutes
  });

export const uploadRateLimit = (
  handler: (req: NextRequest) => Promise<NextResponse> | NextResponse
) =>
  withRateLimit(handler, {
    maxRequests: parseInt(process.env.RATE_LIMIT_UPLOAD_MAX || '10'),
    windowMs: parseInt(process.env.RATE_LIMIT_UPLOAD_WINDOW || '60000'), // 10 uploads per minute
  });

export const searchRateLimit = (
  handler: (req: NextRequest) => Promise<NextResponse> | NextResponse
) =>
  withRateLimit(handler, {
    maxRequests: parseInt(process.env.RATE_LIMIT_SEARCH_MAX || '30'),
    windowMs: parseInt(process.env.RATE_LIMIT_SEARCH_WINDOW || '60000'), // 30 searches per minute
  });

export const dashboardRateLimit = (
  handler: (req: NextRequest) => Promise<NextResponse> | NextResponse
) =>
  withRateLimit(handler, {
    maxRequests: parseInt(process.env.RATE_LIMIT_DASHBOARD_MAX || '60'),
    windowMs: parseInt(process.env.RATE_LIMIT_DASHBOARD_WINDOW || '60000'), // 60 requests per minute
  });

// Generic API rate limiter with configurable options
export const apiRateLimit = (handler: (req: NextRequest) => Promise<NextResponse> | NextResponse) =>
  withRateLimit(handler, {
    maxRequests: parseInt(process.env.RATE_LIMIT_API_MAX || '100'),
    windowMs: parseInt(process.env.RATE_LIMIT_API_WINDOW || '900000'), // 100 requests per 15 minutes
  });
