/**
 * Error Detail API Routes
 * GET /api/errors/[id] - Get error details
 * PATCH /api/errors/[id] - Update error
 * POST /api/errors/[id]/assign - Assign error to user
 * POST /api/errors/[id]/resolve - Resolve error
 * POST /api/errors/[id]/reopen - Reopen error
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchMutation, fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';
import { createLogger } from '@/lib/logger';
import { z } from 'zod';
import { toConvexId } from '@/lib/convex/id-helpers';

const logger = createLogger('api:errors:detail');

/**
 * GET /api/errors/[id]
 * Get error details by ID
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    logger.info('Fetching error details', { id });

    const error = await fetchQuery(api.errors.get, { id: toConvexId(id, 'errors') });

    if (!error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Error not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: error,
    });
  } catch (error) {
    logger.error('Failed to fetch error details', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch error details',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/errors/[id]
 * Update error details
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    logger.info('Updating error', { id, updates: Object.keys(body) });

    const updateSchema = z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      status: z
        .enum(['new', 'assigned', 'in_progress', 'resolved', 'closed', 'reopened'])
        .optional(),
      severity: z.enum(['critical', 'high', 'medium', 'low']).optional(),
      tags: z.array(z.string()).optional(),
      metadata: z.any().optional(),
    });

    const validationResult = updateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const updatedError = await fetchMutation(api.errors.update, {
      id: toConvexId(id, 'errors'),
      ...validationResult.data,
    });

    logger.info('Error updated successfully', { id });

    return NextResponse.json({
      success: true,
      data: updatedError,
      message: 'Error updated successfully',
    });
  } catch (error) {
    logger.error('Failed to update error', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
