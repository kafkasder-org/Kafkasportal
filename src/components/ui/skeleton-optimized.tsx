// High-Performance Loading Skeleton Components
'use client';

import React, { memo } from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  lines?: number;
  height?: string;
  width?: string;
  rounded?: boolean;
  animate?: boolean;
}

export const Skeleton = memo(function Skeleton({
  className,
  lines = 1,
  height = 'h-4',
  width = 'w-full',
  rounded = false,
  animate = true,
}: SkeletonProps) {
  if (lines === 1) {
    return (
      <div
        className={cn(
          'bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200',
          'bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]',
          height,
          width,
          rounded && 'rounded-lg',
          !animate && 'animate-none',
          className
        )}
        style={{
          willChange: 'transform',
          backfaceVisibility: 'hidden',
        }}
      />
    );
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200',
            'bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]',
            height,
            width,
            rounded && 'rounded-lg',
            !animate && 'animate-none',
            i === lines - 1 && width === 'w-full' && 'w-3/4', // Last line shorter
            className
          )}
          style={{
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
});

// Table skeleton with optimized rendering
export const TableSkeleton = memo(function TableSkeleton({
  rows = 8,
  columns = 4,
  rowHeight = 'h-12',
}: {
  rows?: number;
  columns?: number;
  rowHeight?: string;
}) {
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
      {/* Header */}
      <div className={cn('flex items-center px-4 border-b border-slate-200 bg-slate-50/80', rowHeight)}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={i}
            height="h-4"
            width={i === 0 ? 'w-20' : 'w-32'}
            animate={false}
            className="bg-slate-300"
          />
        ))}
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className={cn('flex items-center px-4', rowHeight)}
            style={{
              willChange: 'transform',
              backfaceVisibility: 'hidden',
            }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                height="h-4"
                width={colIndex === 0 ? 'w-16' : 'w-28'}
                animate={false}
                className="bg-slate-200"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
});

// Card skeleton for content loading
export const CardSkeleton = memo(function CardSkeleton({
  lines = 3,
  showImage = false,
  imageHeight = 'h-48',
}: {
  lines?: number;
  showImage?: boolean;
  imageHeight?: string;
}) {
  return (
    <div className="border border-slate-200 rounded-lg p-6 bg-white space-y-4">
      {showImage && (
        <Skeleton
          height={imageHeight}
          width="w-full"
          rounded
          className="bg-slate-200"
        />
      )}
      
      <Skeleton height="h-6" width="w-3/4" className="bg-slate-200" />
      <Skeleton lines={lines} height="h-4" className="bg-slate-200" />
      
      <div className="flex items-center gap-3 pt-2">
        <Skeleton height="h-8" width="w-20" rounded className="bg-slate-200" />
        <Skeleton height="h-8" width="w-24" rounded className="bg-slate-200" />
      </div>
    </div>
  );
});

// Performance optimized animation keyframes
const shimmerKeyframes = `
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
`;

// Inject CSS for optimized animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = shimmerKeyframes;
  document.head.appendChild(style);
}
