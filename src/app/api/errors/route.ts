/**
 * Error Tracking API Routes
 * POST /api/errors - Create or update error record
 * GET /api/errors - List errors with filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchMutation, fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';
import { createLogger } from '@/lib/logger';
import { createErrorNotification } from '@/lib/error-notifications';
import { z } from 'zod';
import { toOptionalConvexId } from '@/lib/convex/id-helpers';

const logger = createLogger('api:errors');

// Validation schema for creating errors
const createErrorSchema = z.object({
  error_code: z.string(),
  title: z.string().min(1).max(500),
  description: z.string(),
  category: z.enum([
    'runtime',
    'ui_ux',
    'design_bug',
    'system',
    'data',
    'security',
    'performance',
    'integration',
  ]),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  stack_trace: z.string().optional(),
  error_context: z.any().optional(),
  user_id: z.string().optional(),
  session_id: z.string().optional(),
  device_info: z.any().optional(),
  url: z.string().optional(),
  component: z.string().optional(),
  function_name: z.string().optional(),
  reporter_id: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.any().optional(),
  fingerprint: z.string().optional(),
  sentry_event_id: z.string().optional(),
});

/**
 * POST /api/errors
 * Create a new error record
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = createErrorSchema.safeParse(body);
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

    const data = validationResult.data;

    logger.info('Creating error record', {
      error_code: data.error_code,
      category: data.category,
      severity: data.severity,
    });

    // Create error in Convex
    const errorId = await fetchMutation(api.errors.create, {
      ...data,
      user_id: toOptionalConvexId(data.user_id, 'users'),
      reporter_id: toOptionalConvexId(data.reporter_id, 'users'),
    });

    // Send notification for critical/high severity errors
    if (data.severity === 'critical' || data.severity === 'high') {
      logger.warn('High severity error detected', {
        errorId,
        severity: data.severity,
        title: data.title,
      });

      // Create notification
      await createErrorNotification({
        errorId: errorId as string,
        errorCode: data.error_code,
        title: data.title,
        severity: data.severity,
        category: data.category,
        component: data.component,
        url: data.url,
      }).catch((err) => {
        logger.error('Failed to create error notification', err);
      });
    }

    logger.info('Error record created successfully', { errorId });

    return NextResponse.json({
      success: true,
      data: { errorId },
      message: 'Error recorded successfully',
    });
  } catch (error) {
    logger.error('Failed to create error record', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create error record',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/errors
 * List errors with filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters with type validation
    const statusParam = searchParams.get('status');
    const severityParam = searchParams.get('severity');
    const categoryParam = searchParams.get('category');
    const assigned_to = searchParams.get('assigned_to');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');
    const limit = searchParams.get('limit');
    const skip = searchParams.get('skip');

    // Validate and type-cast status
    const validStatuses = [
      'new',
      'assigned',
      'in_progress',
      'resolved',
      'closed',
      'reopened',
    ] as const;
    type ValidStatus = (typeof validStatuses)[number];
    const status =
      statusParam && validStatuses.includes(statusParam as ValidStatus)
        ? (statusParam as ValidStatus)
        : undefined;

    // Validate and type-cast severity
    const validSeverities = ['critical', 'high', 'medium', 'low'] as const;
    type ValidSeverity = (typeof validSeverities)[number];
    const severity =
      severityParam && validSeverities.includes(severityParam as ValidSeverity)
        ? (severityParam as ValidSeverity)
        : undefined;

    // Validate and type-cast category
    const validCategories = [
      'runtime',
      'ui_ux',
      'design_bug',
      'system',
      'data',
      'security',
      'performance',
      'integration',
    ] as const;
    type ValidCategory = (typeof validCategories)[number];
    const category =
      categoryParam && validCategories.includes(categoryParam as ValidCategory)
        ? (categoryParam as ValidCategory)
        : undefined;

    logger.info('Listing errors', {
      status,
      severity,
      category,
      limit,
    });

    // Fetch errors from Convex
    const result = await fetchQuery(api.errors.list, {
      status,
      severity,
      category,
      assigned_to: toOptionalConvexId(assigned_to, 'users'),
      start_date: start_date || undefined,
      end_date: end_date || undefined,
      limit: limit ? parseInt(limit) : undefined,
      skip: skip ? parseInt(skip) : undefined,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Failed to list errors', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to list errors',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
