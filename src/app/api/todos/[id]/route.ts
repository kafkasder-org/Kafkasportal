import { NextRequest, NextResponse } from 'next/server';
import { appwriteTodos } from '@/lib/appwrite/api';
import logger from '@/lib/logger';
import { verifyCsrfToken, buildErrorResponse, requireModuleAccess } from '@/lib/api/auth-utils';
import { parseBody } from '@/lib/api/route-helpers';
import { dataModificationRateLimit, readOnlyRateLimit } from '@/lib/rate-limit';
import { todoUpdateSchema } from '@/lib/validations/todo';

/**
 * GET /api/todos/[id]
 */
async function getTodoHandler(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireModuleAccess('todos');
    await readOnlyRateLimit(request);

    const { id } = params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid todo ID',
        },
        { status: 400 }
      );
    }

    const todo = await appwriteTodos.get(id);

    if (!todo) {
      return NextResponse.json(
        {
          success: false,
          error: 'Todo not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: todo,
    });
  } catch (error) {
    logger.error('Failed to fetch todo', { error });
    return buildErrorResponse(error, 500);
  }
}

/**
 * PUT /api/todos/[id]
 */
async function updateTodoHandler(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireModuleAccess('todos');
    await verifyCsrfToken(request);
    await dataModificationRateLimit(request);

    const { id } = params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid todo ID',
        },
        { status: 400 }
      );
    }

    const body = await parseBody(request);

    // Validate with schema
    const result = todoUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Check if todo exists
    const existingTodo = await appwriteTodos.get(id);
    if (!existingTodo) {
      return NextResponse.json(
        {
          success: false,
          error: 'Todo not found',
        },
        { status: 404 }
      );
    }

    const updatedTodo = await appwriteTodos.update(id, result.data);

    return NextResponse.json({
      success: true,
      data: updatedTodo,
    });
  } catch (error) {
    logger.error('Failed to update todo', { error });
    return buildErrorResponse(error, 500);
  }
}

/**
 * DELETE /api/todos/[id]
 */
async function deleteTodoHandler(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireModuleAccess('todos');
    await verifyCsrfToken(request);
    await dataModificationRateLimit(request);

    const { id } = params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid todo ID',
        },
        { status: 400 }
      );
    }

    // Check if todo exists
    const existingTodo = await appwriteTodos.get(id);
    if (!existingTodo) {
      return NextResponse.json(
        {
          success: false,
          error: 'Todo not found',
        },
        { status: 404 }
      );
    }

    await appwriteTodos.remove(id);

    return NextResponse.json({
      success: true,
      message: 'Todo deleted successfully',
    });
  } catch (error) {
    logger.error('Failed to delete todo', { error });
    return buildErrorResponse(error, 500);
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return getTodoHandler(request, { params });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return updateTodoHandler(request, { params });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return deleteTodoHandler(request, { params });
}
