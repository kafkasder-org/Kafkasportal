/**
 * Error Statistics and Trends API
 * GET /api/errors/stats - Get error statistics
 * GET /api/errors/trends - Get error trends
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';
import { createLogger } from '@/lib/logger';

const logger = createLogger('api:errors:stats');

/**
 * GET /api/errors/stats
 * Get error statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');

    logger.info('Fetching error statistics', { start_date, end_date });

    const stats = await fetchQuery(api.errors.getStats, {
      start_date: start_date || undefined,
      end_date: end_date || undefined,
    });

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Failed to fetch error statistics', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch error statistics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
