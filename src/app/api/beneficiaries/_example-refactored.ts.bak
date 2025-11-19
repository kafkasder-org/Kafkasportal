/**
 * EXAMPLE: Standardized API Route Pattern
 *
 * Before: ~200+ lines with duplicated error handling, auth checks
 * After: ~80 lines with clean middleware composition
 *
 * This shows how to refactor beneficiaries/route.ts using the new middleware
 * Apply the same pattern to all other API routes
 */

import { NextRequest } from 'next/server';
import { buildApiRoute } from '@/lib/api/middleware';
import { successResponse, errorResponse, parseBody } from '@/lib/api/route-helpers';
import { convexBeneficiaries, normalizeQueryParams } from '@/lib/convex/api';
import { beneficiarySchema } from '@/lib/validations/beneficiary';
import type { BeneficiaryInput } from '@/lib/validations/beneficiary';

// ========================================
// EXAMPLE GET HANDLER (Standardized)
// ========================================

/**
 * GET /api/beneficiaries
 * List beneficiaries with pagination and filters
 *
 * ✅ Uses buildApiRoute for standard middleware
 * ✅ Clean error handling via middleware
 * ✅ Module access check automatic
 * ✅ Rate limiting optional
 * ✅ Logging automatic
 */
export const GET = buildApiRoute({
  requireModule: 'beneficiaries',
  allowedMethods: ['GET'],
  rateLimit: { maxRequests: 100, windowMs: 60000 },
})(async (request: NextRequest) => {
  // Simple, clean handler - all error handling done by middleware
  const { searchParams } = new URL(request.url);
  const params = normalizeQueryParams(searchParams);

  const response = await convexBeneficiaries.list({
    ...params,
    city: searchParams.get('city') || undefined,
  });

  const beneficiaries = response.documents || [];
  const total = response.total || 0;

  return successResponse(
    { beneficiaries, total },
    `${total} kayıt bulundu`
  );
});

// ========================================
// EXAMPLE POST HANDLER (Standardized)
// ========================================

/**
 * POST /api/beneficiaries
 * Create new beneficiary
 *
 * ✅ Uses buildApiRoute with CSRF and auth
 * ✅ Schema validation using Zod
 * ✅ Single source of truth for validation
 * ✅ Error handling standardized
 */
export const POST = buildApiRoute({
  requireModule: 'beneficiaries',
  allowedMethods: ['POST'],
  rateLimit: { maxRequests: 20, windowMs: 60000 },
})(async (request: NextRequest) => {
  const { data, error: parseError } = await parseBody<BeneficiaryInput>(request);

  if (parseError) {
    return errorResponse(parseError, 400);
  }

  if (!data) {
    return errorResponse('İstek gövdesi gereklidir', 400);
  }

  // Validate with Zod schema
  const validationResult = beneficiarySchema.safeParse(data);
  if (!validationResult.success) {
    return errorResponse(
      'Doğrulama hatası',
      400,
      validationResult.error.errors.map((e) => e.message)
    );
  }

  // Create beneficiary
  const result = await convexBeneficiaries.create(validationResult.data);

  if (result.error) {
    return errorResponse(result.error, 400);
  }

  return successResponse(
    result.data,
    'İhtiyaç sahibi başarıyla oluşturuldu',
    201
  );
});

// ========================================
// COMPARISON TABLE
// ========================================

/*
BEFORE (Current Implementation):
- Lines: ~200+
- Try-catch: Multiple (one per handler)
- Error handling: Duplicated
- Module check: Manual
- Auth check: Manual
- Logging: Manual
- Response format: Inconsistent
- Validation: Custom logic

AFTER (Standardized):
- Lines: ~80
- Try-catch: 1 (in middleware)
- Error handling: Centralized
- Module check: Automatic via middleware
- Auth check: Automatic via middleware
- Logging: Automatic via middleware
- Response format: Consistent
- Validation: Schema-based (Zod)

Benefits:
✅ 60% less code
✅ Single responsibility
✅ Reusable patterns
✅ Easier testing
✅ Consistent error responses
✅ Automatic logging
✅ Built-in security (CSRF, rate limit)
✅ Type-safe validation
*/
