'use client';

import { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import logger from '@/lib/logger';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  isolate?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary Component
 * Catches React errors and displays fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('ErrorBoundary caught error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    this.props.onError?.(error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      return <DefaultErrorFallback error={this.state.error} reset={this.reset} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error;
  reset: () => void;
  isDev?: boolean;
}

/**
 * Default Error Fallback UI
 */
export function DefaultErrorFallback({
  error,
  reset,
  isDev = process.env.NODE_ENV === 'development',
}: ErrorFallbackProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 border border-red-200">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-slate-900 text-center mb-2">
            Bir Hata Oluştu
          </h1>
          <p className="text-slate-600 text-center mb-6">
            Üzgünüz, bir şeyler ters gitti. Lütfen sayfayı yenileyiniz.
          </p>

          {/* Error Message (Dev Only) */}
          {isDev && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs font-mono text-red-600 mb-2">
                <strong>Hata:</strong>
              </p>
              <p className="text-xs text-red-600 font-mono break-all">
                {error.message}
              </p>
              {error.stack && (
                <details className="mt-3">
                  <summary className="text-xs font-semibold text-red-600 cursor-pointer hover:text-red-700">
                    Stack Trace
                  </summary>
                  <pre className="mt-2 text-xs text-red-600 overflow-auto max-h-40 bg-white p-2 rounded border border-red-100">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}

          {/* Error Code */}
          <div className="mb-6 p-3 bg-slate-100 rounded-lg text-center">
            <p className="text-xs text-slate-600">Hata Kodu:</p>
            <p className="text-sm font-mono font-semibold text-slate-900">
              {error.name || 'UNKNOWN_ERROR'}
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={reset}
              className="w-full flex items-center justify-center gap-2"
              variant="default"
            >
              <RefreshCw className="h-4 w-4" />
              Yeniden Dene
            </Button>
            <Link href="/genel" className="block">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <Home className="h-4 w-4" />
                Anasayfaya Git
              </Button>
            </Link>
          </div>

          {/* Help */}
          <p className="text-xs text-slate-500 text-center mt-6">
            Problem devam ederse lütfen destek ekibi ile iletişime geçiniz.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Minimal Error Fallback (for sections/components)
 */
export function MinimalErrorFallback({
  error,
  reset,
  title = 'Hata',
}: ErrorFallbackProps & { title?: string }) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-red-900">{title}</h3>
          <p className="text-sm text-red-800 mt-1">{error.message}</p>
          <button
            onClick={reset}
            className="mt-3 text-sm font-medium text-red-600 hover:text-red-700 underline"
          >
            Yeniden Dene
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Async Error Boundary (for Suspense + Error Boundaries)
 */
interface AsyncErrorBoundaryProps extends Props {
  resetKeys?: Array<string | number>;
}

export class AsyncErrorBoundary extends Component<
  AsyncErrorBoundaryProps,
  State
> {
  constructor(props: AsyncErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('AsyncErrorBoundary caught error', {
      error: error.message,
      errorInfo,
    });

    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: AsyncErrorBoundaryProps) {
    const { resetKeys } = this.props;
    const { resetKeys: prevResetKeys } = prevProps;

    if (
      resetKeys &&
      prevResetKeys &&
      resetKeys.length !== prevResetKeys.length
    ) {
      this.setState({ hasError: false, error: undefined });
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      return (
        <MinimalErrorFallback error={this.state.error} reset={this.reset} />
      );
    }

    return this.props.children;
  }
}

/**
 * Hook for non-React error handling
 */
export function useErrorHandler() {
  return {
    captureException: (error: Error | string, context?: Record<string, unknown>) => {
      const err = typeof error === 'string' ? new Error(error) : error;
      logger.error('Uncaught error', {
        error: err.message,
        stack: err.stack,
        context,
      });
    },
  };
}
