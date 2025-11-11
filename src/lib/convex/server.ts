import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { getServerEnv } from '@/lib/env-validation';

type ConvexHttpClientProxy = ConvexHttpClient & {
  /**
   * Returns the raw Convex HTTP client instance. Useful when
   * additional configuration (setAuth, etc.) is required.
   */
  __unsafe__getClient(): ConvexHttpClient;
};

const serverEnv = getServerEnv();

// Get Convex URL from environment
const convexUrl = serverEnv.NEXT_PUBLIC_CONVEX_URL || '';

// Check if we're in build mode (Next.js sets this during build)
const isBuildTime =
  process.env.NEXT_PHASE === 'phase-production-build' ||
  (process.env.NODE_ENV === 'production' && !convexUrl);

// Lazy initialization to avoid build errors when URL is not set
let _convexHttp: ConvexHttpClient | null = null;

const buildPlaceholderUrl = 'https://build-placeholder.convex.cloud';

const createConvexClient = (): ConvexHttpClient => {
  if (isBuildTime && (!convexUrl || convexUrl.trim() === '')) {
    return new ConvexHttpClient(buildPlaceholderUrl);
  }

  if (!convexUrl || convexUrl.trim() === '') {
    throw new Error(
      'NEXT_PUBLIC_CONVEX_URL is not set. Please define it in your environment (e.g. .env.local).'
    );
  }

  return new ConvexHttpClient(convexUrl);
};

// Get or create Convex HTTP client (lazy initialization)
// This only creates the client when actually used, not during build
export const getConvexHttp = (): ConvexHttpClient => {
  if (!_convexHttp) {
    _convexHttp = createConvexClient();
  }
  return _convexHttp;
};

// Export for backward compatibility (lazy getter)
// This Proxy delays client creation until actual property access
export const convexHttp: ConvexHttpClientProxy = new Proxy({} as ConvexHttpClient, {
  get(_target, prop) {
    if (prop === '__unsafe__getClient') {
      return () => getConvexHttp();
    }
    // Only create client when a property is actually accessed (runtime)
    // This prevents build-time errors when URL is not set
    return getConvexHttp()[prop as keyof ConvexHttpClient];
  },
}) as ConvexHttpClientProxy;

// Export API reference for type safety
export { api };

// Helper to check if Convex is properly configured
export const isConvexConfigured = (): boolean => {
  return Boolean(convexUrl && convexUrl.trim() !== '');
};
