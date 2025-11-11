import { NextResponse } from 'next/server';
import logger from '@/lib/logger';
import { convexHttp } from '@/lib/convex/server';
import { api } from '@/convex/_generated/api';

// Cache for detailed health checks (30 seconds)
let healthCache: { data: unknown; timestamp: number } | null = null;
const CACHE_DURATION = 30 * 1000; // 30 seconds

export async function GET(request: Request) {
  const url = new URL(request.url);
  const detailed = url.searchParams.get('detailed') === 'true';

  // Basic checks
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || '';
  const provider = (
    process.env.NEXT_PUBLIC_BACKEND_PROVIDER ||
    process.env.BACKEND_PROVIDER ||
    'convex'
  ).toLowerCase();

  const configOk = Boolean(convexUrl && provider === 'convex');

  const baseResponse = {
    ok: true,
    provider,
    convex: {
      url: Boolean(convexUrl),
      configured: configOk,
    },
    timestamp: new Date().toISOString(),
    readyForProduction: configOk,
  };

  // Return basic response if not detailed
  if (!detailed) {
    return NextResponse.json(baseResponse);
  }

  // Check cache for detailed checks
  const now = Date.now();
  if (healthCache && now - healthCache.timestamp < CACHE_DURATION) {
    return NextResponse.json({
      ...baseResponse,
      ...(healthCache.data as object),
      cached: true,
    });
  }

  // Run comprehensive checks
  let connectivityReport: Record<string, unknown> | null = null;
  let connectivityError: string | null = null;
  let validationReport: Record<string, unknown> | null = null;

  if (provider === 'convex' && convexUrl) {
    try {
      // Test Convex connectivity by querying users
      const startTime = Date.now();
      await convexHttp.query(api.users.list, {});
      const responseTime = Date.now() - startTime;

      connectivityReport = {
        summary: {
          overallHealth: responseTime < 1000 ? 100 : responseTime < 3000 ? 75 : 50,
          passedTests: 1,
          failedTests: responseTime > 3000 ? 1 : 0,
        },
        tests: [
          {
            name: 'Convex Connection',
            passed: true,
            responseTime,
            message: `Connected in ${responseTime}ms`,
          },
        ],
        recommendations: responseTime > 3000 ? ['Convex connection is slow'] : [],
      };

      validationReport = {
        summary: {
          errors: 0,
          warnings: convexUrl ? 0 : 1,
        },
        errors: [],
        warnings: convexUrl ? [] : ['NEXT_PUBLIC_CONVEX_URL is not set'],
      };
    } catch (_error: unknown) {
      connectivityError = _error instanceof Error ? _error.message : 'Bilinmeyen hata';
      logger.error('Convex connectivity test failed', _error, {
        endpoint: '/api/health',
        provider,
        detailed: true,
      });

      connectivityReport = {
        summary: {
          overallHealth: 0,
          passedTests: 0,
          failedTests: 1,
        },
        tests: [
          {
            name: 'Convex Connection',
            passed: false,
            message: connectivityError,
          },
        ],
        recommendations: ['Check NEXT_PUBLIC_CONVEX_URL configuration'],
      };

      validationReport = {
        summary: {
          errors: 1,
          warnings: 0,
        },
        errors: [`Convex connection failed: ${connectivityError}`],
        warnings: [],
      };
    }
  } else {
    validationReport = {
      summary: {
        errors: convexUrl ? 0 : 1,
        warnings: 0,
      },
      errors: convexUrl ? [] : ['NEXT_PUBLIC_CONVEX_URL is not configured'],
      warnings: [],
    };
  }

  // Aggregate recommendations
  const recommendations: string[] = [];

  if (
    validationReport?.summary &&
    typeof validationReport.summary === 'object' &&
    'errors' in validationReport.summary &&
    (validationReport.summary as { errors: number }).errors > 0
  ) {
    recommendations.push('Fix environment variable configuration errors');
  }

  if (
    connectivityReport &&
    connectivityReport.summary &&
    typeof connectivityReport.summary === 'object' &&
    'failedTests' in connectivityReport.summary &&
    (connectivityReport.summary as { failedTests: number }).failedTests > 0
  ) {
    const recs = connectivityReport.recommendations as string[] | undefined;
    if (recs) recommendations.push(...recs);
  }

  // Determine status code
  let statusCode = 200;
  if (
    provider === 'convex' &&
    connectivityReport &&
    connectivityReport.summary &&
    typeof connectivityReport.summary === 'object' &&
    'overallHealth' in connectivityReport.summary &&
    (connectivityReport.summary as { overallHealth: number }).overallHealth < 50
  ) {
    statusCode = 503; // Service unavailable
  }

  const detailedData = {
    validation: validationReport,
    connectivity: connectivityReport,
    connectivityError,
    recommendations,
  };

  // Cache the detailed results
  healthCache = {
    data: detailedData,
    timestamp: now,
  };

  return NextResponse.json(
    {
      ...baseResponse,
      ...detailedData,
    },
    { status: statusCode }
  );
}
