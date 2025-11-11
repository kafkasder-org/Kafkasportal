// Performance Monitoring System
'use client';

import React, { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  
  // Custom metrics
  routeTransitionTime?: number;
  modalOpenTime?: number;
  scrollPerformance?: number;
  memoryUsage?: number;
  
  // Navigation timing
  pageLoadTime?: number;
  domContentLoaded?: number;
  resourceLoadTime?: number;
}

interface PerformanceMonitorProps {
  enableWebVitals?: boolean;
  enableCustomMetrics?: boolean;
  onMetrics?: (metrics: PerformanceMetrics) => void;
  routeName?: string;
}

export function PerformanceMonitor({
  enableWebVitals = true,
  enableCustomMetrics = true,
  onMetrics,
  routeName = 'unknown',
}: PerformanceMonitorProps) {
  const routeStartTime = useRef<number>(0);
  const modalOpenTime = useRef<number>(0);
  const scrollStartTime = useRef<number>(0);

  // Web Vitals monitoring
  useEffect(() => {
    if (!enableWebVitals) return;

    // Largest Contentful Paint
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry;
      
      if (lastEntry) {
        const metrics: PerformanceMetrics = { lcp: lastEntry.startTime };
        onMetrics?.(metrics);
      }
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const firstInputEntry = entry as PerformanceEventTiming;
        const metrics: PerformanceMetrics = { fid: firstInputEntry.processingStart - firstInputEntry.startTime };
        onMetrics?.(metrics);
      }
    });

    fidObserver.observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShiftEntry = entry as LayoutShift;
        if (!layoutShiftEntry.hadRecentInput) {
          clsValue += layoutShiftEntry.value;
        }
      }
      const metrics: PerformanceMetrics = { cls: clsValue };
      onMetrics?.(metrics);
    });

    clsObserver.observe({ entryTypes: ['layout-shift'] });

    return () => {
      observer.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
    };
  }, [enableWebVitals, onMetrics]);

  // Route transition timing
  useEffect(() => {
    if (!enableCustomMetrics) return;

    routeStartTime.current = performance.now();

    return () => {
      if (routeStartTime.current) {
        const routeTransitionTime = performance.now() - routeStartTime.current;
        const metrics: PerformanceMetrics = { routeTransitionTime };
        onMetrics?.(metrics);
      }
    };
  }, [routeName, enableCustomMetrics, onMetrics]);

  return null;
}

// Custom hooks for performance tracking
export const usePerformanceTracking = () => {
  const trackModalOpen = useCallback(() => {
    return performance.now();
  }, []);

  const trackModalClose = useCallback((startTime: number) => {
    const modalOpenTime = performance.now() - startTime;
    return modalOpenTime;
  }, []);

  const trackScrollPerformance = useCallback((callback: () => void) => {
    const startTime = performance.now();
    callback();
    const scrollPerformance = performance.now() - startTime;
    return scrollPerformance;
  }, []);

  const getMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      return memoryInfo.usedJSHeapSize;
    }
    return null;
  }, []);

  return {
    trackModalOpen,
    trackModalClose,
    trackScrollPerformance,
    getMemoryUsage,
  };
};

// Performance monitoring hook
export const usePerformanceMonitor = (routeName: string) => {
  const metricsRef = useRef<PerformanceMetrics>({});
  const { trackModalOpen, trackModalClose, getMemoryUsage } = usePerformanceTracking();

  const trackRouteTransition = useCallback(() => {
    const startTime = performance.now();
    return () => {
      const routeTransitionTime = performance.now() - startTime;
      metricsRef.current.routeTransitionTime = routeTransitionTime;
    };
  }, []);

  const trackModalPerformance = useCallback(() => {
    const startTime = trackModalOpen();
    return () => {
      const modalOpenTime = trackModalClose(startTime);
      metricsRef.current.modalOpenTime = modalOpenTime;
    };
  }, [trackModalOpen, trackModalClose]);

  const updateMemoryUsage = useCallback(() => {
    const memoryUsage = getMemoryUsage();
    if (memoryUsage) {
      metricsRef.current.memoryUsage = memoryUsage;
    }
  }, [getMemoryUsage]);

  const getMetrics = useCallback(() => {
    return { ...metricsRef.current };
  }, []);

  return {
    trackRouteTransition,
    trackModalPerformance,
    updateMemoryUsage,
    getMetrics,
  };
};

// Performance boundary component
interface PerformanceBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface PerformanceBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class PerformanceBoundary extends React.Component<
  PerformanceBoundaryProps,
  PerformanceBoundaryState
> {
  constructor(props: PerformanceBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Performance Boundary Error:', error, errorInfo);
    
    // Track performance errors
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark('performance-error');
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Bir sorun oluştu</h2>
            <p className="text-slate-600 mb-4">Sayfa yüklenirken beklenmeyen bir hata oldu.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sayfayı Yenile
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// FPS Monitor for real-time performance tracking
export const useFPSMonitor = (enabled = true) => {
  const fpsRef = useRef<number>(60);
  const frameCountRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    lastTimeRef.current = performance.now();

    const measureFPS = () => {
      frameCountRef.current++;
      
      const currentTime = performance.now();
      if (currentTime - lastTimeRef.current >= 1000) {
        fpsRef.current = Math.round((frameCountRef.current * 1000) / (currentTime - lastTimeRef.current));
        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }

      requestAnimationFrame(measureFPS);
    };

    const animationId = requestAnimationFrame(measureFPS);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [enabled]);

  const getFPS = useCallback(() => {
    return fpsRef.current;
  }, []);

  const isGoodPerformance = useCallback(() => {
    return fpsRef.current >= 55; // Good performance threshold
  }, []);

  return {
    getFPS,
    isGoodPerformance,
  };
};

// Performance optimized console logger
export const perfLog = {
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 [PERF] ${message}`, data);
    }
  },
  
  warn: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`⚠️ [PERF] ${message}`, data);
    }
  },
  
  error: (message: string, data?: any) => {
    console.error(`❌ [PERF] ${message}`, data);
  },
};
