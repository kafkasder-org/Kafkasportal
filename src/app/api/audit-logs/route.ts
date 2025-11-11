import { NextRequest, NextResponse } from 'next/server';
import { getConvexHttp } from '@/lib/convex/server';
import logger from '@/lib/logger';
import type { FunctionReference } from 'convex/server';

/**
 * GET /api/audit-logs
 * Retrieve audit logs for compliance
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');
    const resource = searchParams.get('resource');
    const limit = parseInt(searchParams.get('limit') || '100');

    const convex = getConvexHttp();

    const params: {
      action?: string;
      resource?: string;
      limit?: number;
    } = { limit };

    if (action) {
      params.action = action;
    }

    if (resource) {
      params.resource = resource;
    }

    // Use internal function reference since audit_logs not in generated API yet
    const logs = await convex.query(
      'audit_logs:list' as unknown as FunctionReference<'query'>,
      params
    );

    return NextResponse.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    logger.error('Audit logs fetch error', error, {
      endpoint: '/api/audit-logs',
      method: 'GET',
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Denetim kayıtları alınamadı',
      },
      { status: 500 }
    );
  }
}
