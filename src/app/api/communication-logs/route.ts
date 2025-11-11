import { NextRequest, NextResponse } from 'next/server';
import { getConvexHttp } from '@/lib/convex/server';
import logger from '@/lib/logger';
import type { FunctionReference } from 'convex/server';

/**
 * GET /api/communication-logs
 * Retrieve communication logs (email and SMS)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') as 'email' | 'sms' | null;
    const status = searchParams.get('status') as 'sent' | 'failed' | 'pending' | null;
    const limit = parseInt(searchParams.get('limit') || '100');

    const convex = getConvexHttp();

    const params: {
      type?: 'email' | 'sms';
      status?: 'sent' | 'failed' | 'pending';
      limit?: number;
    } = { limit };

    if (type) {
      params.type = type;
    }

    if (status) {
      params.status = status;
    }

    // Use internal function reference since communication_logs not in generated API yet
    const logs = await convex.query(
      'communication_logs:list' as unknown as FunctionReference<'query'>,
      params
    );

    return NextResponse.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    logger.error('Communication logs fetch error', error, {
      endpoint: '/api/communication-logs',
      method: 'GET',
    });

    return NextResponse.json(
      {
        success: false,
        error: 'İletişim kayıtları alınamadı',
      },
      { status: 500 }
    );
  }
}
