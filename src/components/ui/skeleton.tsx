import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const skeletonVariants = cva('animate-shimmer rounded-md bg-muted/50 relative overflow-hidden', {
  variants: {
    variant: {
      default: 'rounded-md',
      circle: 'rounded-full',
      text: 'h-4 w-full',
      input: 'h-9 w-full rounded-md',
      card: 'h-32 w-full rounded-xl',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

function Skeleton({ className, variant, ...props }: SkeletonProps) {
  return (
    <div className={cn(skeletonVariants({ variant }), className)} {...props}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
    </div>
  );
}

export { Skeleton };
