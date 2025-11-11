/**
 * Error Assignment API
 * POST /api/errors/[id]/assign - Assign error to user and create task
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchMutation, fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { createLogger } from '@/lib/logger';
import { z } from 'zod';
import { toConvexId } from '@/lib/convex/id-helpers';

const logger = createLogger('api:errors:assign');

const assignSchema = z.object({
  assigned_to: z.string(),
  create_task: z.boolean().optional().default(true),
});

/**
 * POST /api/errors/[id]/assign
 * Assign error to user and optionally create a task
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate request
    const validationResult = assignSchema.safeParse(body);
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

    const { assigned_to, create_task } = validationResult.data;

    logger.info('Assigning error', { id, assigned_to, create_task });

    // Get error details
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

    // Assign error
    const updatedError = await fetchMutation(api.errors.assign, {
      id: toConvexId(id, 'errors'),
      assigned_to: toConvexId(assigned_to, 'users'),
    });

    // Create task if requested
    let taskId: Id<'tasks'> | null = null;
    if (create_task) {
      try {
        // Determine task priority based on error severity
        let taskPriority: 'low' | 'normal' | 'high' | 'urgent' = 'normal';
        if (error.severity === 'critical') taskPriority = 'urgent';
        else if (error.severity === 'high') taskPriority = 'high';
        else if (error.severity === 'medium') taskPriority = 'normal';
        else taskPriority = 'low';

        // Create task
        taskId = await fetchMutation(api.tasks.create, {
          title: `Fix: ${error.title}`,
          description: `${error.description}

Hata Kodu: ${error.error_code}
Kategori: ${error.category}
${error.component ? `Bileşen: ${error.component}` : ''}`,
          assigned_to: toConvexId(assigned_to, 'users'),
          created_by: toConvexId(assigned_to, 'users'), // In real scenario, would be current user
          priority: taskPriority,
          status: 'pending',
          category: 'bug_fix',
          tags: ['error', error.category, error.severity],
          is_read: false,
        });

        // Link task to error
        if (taskId) {
          await fetchMutation(api.errors.linkTask, {
            id: toConvexId(id, 'errors'),
            task_id: taskId,
          });
        }

        logger.info('Task created for error', { errorId: id, taskId });
      } catch (taskError) {
        logger.error('Failed to create task for error', taskError, { errorId: id });
        // Continue even if task creation fails
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        error: updatedError,
        taskId,
      },
      message: 'Error assigned successfully',
    });
  } catch (error) {
    logger.error('Failed to assign error', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to assign error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
