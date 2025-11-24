import { NextRequest, NextResponse } from 'next/server';
import { appwriteTodos, normalizeQueryParams } from '@/lib/appwrite/api';
import logger from '@/lib/logger';
import { verifyCsrfToken, buildErrorResponse, requireModuleAccess } from '@/lib/api/auth-utils';
import { parseBody } from '@/lib/api/route-helpers';
import { dataModificationRateLimit, readOnlyRateLimit } from '@/lib/rate-limit';
import { todoSchema } from '@/lib/validations/todo';

function validateTodo(data: Record<string, unknown>): {
  isValid: boolean;
  errors: string[];
  normalizedData?: Record<string, unknown>;
} {
  const errors: string[] = [];
  if (!data.title || (typeof data.title === 'string' && data.title.trim().length < 1)) {
    errors.push('Yapılacak başlığı boş olamaz');
  }
  if (data.priority && !['low', 'normal', 'high', 'urgent'].includes(data.priority as string)) {
    errors.push('Geçersiz öncelik değeri');
  }
  if (typeof data.completed !== 'boolean' && data.completed !== undefined) {
    errors.push('Tamamlama durumu boolean olmalıdır');
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  const normalizedData = {
    ...data,
    priority: (data.priority as string) || 'normal',
    completed: typeof data.completed === 'boolean' ? data.completed : false,
    is_read: typeof data.is_read === 'boolean' ? data.is_read : false,
  };

  return { isValid: true, errors: [], normalizedData };
}

/**
 * GET /api/todos
 */
async function getTodosHandler(request: NextRequest) {
  try {
    await requireModuleAccess('todos');
    await readOnlyRateLimit(request);

    const { searchParams } = new URL(request.url);
    const params = normalizeQueryParams(searchParams);

    const response = await appwriteTodos.list(params);

    return NextResponse.json({
      success: true,
      data: response.documents,
      total: response.total,
    });
  } catch (error) {
    logger.error('Failed to fetch todos', { error });
    return buildErrorResponse(error, 500);
  }
}

/**
 * POST /api/todos
 */
async function createTodoHandler(request: NextRequest) {
  try {
    await requireModuleAccess('todos');
    await verifyCsrfToken(request);
    await dataModificationRateLimit(request);

    const body = await parseBody(request);

    // Validate with schema
    const result = todoSchema.safeParse(body);
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

    const todo = await appwriteTodos.create(result.data);

    return NextResponse.json(
      {
        success: true,
        data: todo,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Failed to create todo', { error });
    return buildErrorResponse(error, 500);
  }
}

export async function GET(request: NextRequest) {
  return getTodosHandler(request);
}

export async function POST(request: NextRequest) {
  return createTodoHandler(request);
}
