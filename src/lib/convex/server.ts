/**
 * Stub for backward compatibility
 * Convex has been removed - these exports are stubs for tests
 * TODO: Update tests to use Appwrite mocks instead
 */

import { vi } from 'vitest';

export const convexHttp = {
  query: vi.fn(),
  mutation: vi.fn(),
  action: vi.fn(),
};

export default { convexHttp };
