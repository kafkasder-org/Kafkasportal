/**
 * Error Boundary Component
 * Catches and displays errors in React component tree
 */

import React, { ReactNode, ReactElement } from 'react';
import { AppError, ErrorHandler, ErrorSeverity } from '@/lib/errors/AppError';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactElement;
  onError?: (error: AppError) => void;
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  error: AppError | null;
  errorInfo: React.ErrorInfo | null;
  errorCount: number;
}

/**
 * Error boundary component that catches errors in child components
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error: error instanceof AppError ? error : new AppError(error.message) };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Update state with error details
    this.setState((prev) => ({
      errorInfo,
      errorCount: prev.errorCount + 1,
    }));

    // Convert to AppError if needed
    const appError = error instanceof AppError ? error : new AppError(error.message);

    // Log error
    ErrorHandler.log(appError);

    // Call error callback if provided
    this.props.onError?.(appError);

    // Alert on critical errors
    if (appError.severity === ErrorSeverity.CRITICAL) {
      console.error('CRITICAL ERROR CAUGHT:', error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    const { error, errorInfo } = this.state;
    const { children, fallback, showDetails = false } = this.props;

    // Show custom fallback if provided
    if (fallback && error) {
      return fallback;
    }

    // Show default error UI
    if (error) {
      const userMessage = ErrorHandler.getUserMessage(error);
      const showDevDetails = showDetails && process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="w-full max-w-md border-red-200 bg-red-50">
            <CardHeader>
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <CardTitle>Something went wrong</CardTitle>
              </div>
              <CardDescription>Error ID: {error.id}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* User-friendly message */}
              <div className="text-sm text-gray-700">
                <p>{userMessage}</p>
              </div>

              {/* Developer details (only in development) */}
              {showDevDetails && (
                <div className="space-y-2 p-3 bg-white rounded border border-red-200">
                  <div>
                    <p className="text-xs font-semibold text-gray-600">Error Code</p>
                    <p className="text-xs text-gray-700 font-mono">{error.code}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-600">Message</p>
                    <p className="text-xs text-gray-700 font-mono">{error.message}</p>
                  </div>

                  {error.details && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600">Details</p>
                      <pre className="text-xs text-gray-700 bg-gray-100 p-2 rounded overflow-auto max-h-32">
                        {JSON.stringify(error.details, null, 2)}
                      </pre>
                    </div>
                  )}

                  {errorInfo?.componentStack && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600">Component Stack</p>
                      <pre className="text-xs text-gray-700 bg-gray-100 p-2 rounded overflow-auto max-h-32">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 pt-4">
                <Button onClick={this.handleReset} className="flex-1" variant="default" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try again
                </Button>

                <Button
                  onClick={() => (window.location.href = '/')}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Go home
                </Button>
              </div>

              {/* Development info */}
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={() => this.setState((prev) => ({ errorInfo: prev.errorInfo }))}
                  className="w-full text-xs text-gray-500 hover:text-gray-700 mt-2 underline"
                >
                  {showDevDetails ? 'Hide' : 'Show'} technical details
                </button>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return children;
  }
}

/**
 * Async error boundary hook
 * For catching errors in async operations
 */
export function useErrorBoundary() {
  const [error, setError] = React.useState<AppError | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return {
    error,
    setError,
    resetError: () => setError(null),
    throwError: (error: AppError) => setError(error),
  };
}

/**
 * Safe async operation wrapper
 * Wraps async operations with error handling
 */
export async function withErrorBoundary<T>(
  operation: () => Promise<T>,
  fallback?: (error: AppError) => T
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const appError = error instanceof AppError ? error : new AppError(String(error));

    ErrorHandler.log(appError);

    if (fallback) {
      return fallback(appError);
    }

    throw appError;
  }
}
