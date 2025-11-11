import { ConvexReactClient } from 'convex/react';

// Get Convex URL from environment
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || '';

// Improved build-time detection - check multiple conditions
const isBuildTime =
  process.env.NEXT_PHASE === 'phase-production-build' ||
  (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_CONVEX_URL);

// Validate URL format before attempting to create client
const isValidUrl = (url: string): boolean => {
  if (!url || url.trim() === '') {
    return false;
  }

  // Check for placeholder URL
  if (url === 'https://your-convex-production-url.convex.cloud') {
    return false;
  }

  // Must be absolute URL (starts with http:// or https://)
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return false;
  }

  // Must match Convex URL pattern
  if (!url.includes('.convex.cloud')) {
    return false;
  }

  // Try to create URL object to validate format
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

const isInvalidUrl = !isValidUrl(convexUrl);
const shouldDeferClientCreation = isBuildTime || isInvalidUrl;

// Create Convex client only when we have a valid URL and aren't in build mode
const createConvexClient = () => {
  // Early return if we should defer client creation
  if (shouldDeferClientCreation) {
    return null; // Return null during build or when URL is invalid
  }

  // Additional validation before constructor call (defensive check)
  if (!isValidUrl(convexUrl)) {
    if (isBuildTime) {
      // Silent during build - this is expected
    } else {
      console.warn(
        `⚠️ Invalid Convex URL format: ${convexUrl}. Expected format: https://your-project.convex.cloud`
      );
    }
    return null;
  }

  // Create client with proper error handling
  try {
    return new ConvexReactClient(convexUrl, {
      // Optional: Configure websocket connection
      // unsavedChangesWarning: false,
    });
  } catch (error) {
    // During build, log as warning instead of error
    if (isBuildTime) {
      console.warn('🔧 Convex client creation skipped during build time');
    } else {
      console.error('Failed to initialize Convex client:', error);
    }
    return null;
  }
};

// Create the client (or null if not possible)
export const convex = createConvexClient();

// Helper to check if Convex is properly configured
export const isConvexConfigured = (): boolean => {
  return Boolean(convex);
};

// Helper to check if we should defer Convex usage
export const shouldUseConvex = (): boolean => {
  return !shouldDeferClientCreation && isConvexConfigured();
};

// Export Convex URL for debugging
export const getConvexUrl = (): string => {
  return convexUrl;
};

// Log configuration status (only in development)
if (process.env.NODE_ENV === 'development') {
  if (shouldUseConvex()) {
    console.log('✅ Convex client initialized successfully');
  } else if (isBuildTime) {
    // Silent during build - this is expected
  } else {
    console.warn('⚠️ Convex client not initialized - check NEXT_PUBLIC_CONVEX_URL');
  }
}
