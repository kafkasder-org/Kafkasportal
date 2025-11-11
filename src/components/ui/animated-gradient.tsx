import React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedGradientProps {
  variant?: 'subtle' | 'vibrant' | 'aurora' | 'mesh';
  speed?: 'slow' | 'normal' | 'fast';
  className?: string;
}

export const AnimatedGradient: React.FC<AnimatedGradientProps> = ({
  variant = 'subtle',
  speed = 'normal',
  className,
}) => {
  const getSpeedClass = () => {
    switch (speed) {
      case 'slow':
        return 'animate-gradient-shift-slow';
      case 'fast':
        return 'animate-gradient-shift-fast';
      case 'normal':
      default:
        return 'animate-gradient-shift';
    }
  };

  const getGradientClass = () => {
    switch (variant) {
      case 'subtle':
        return 'bg-gradient-subtle';
      case 'vibrant':
        return 'bg-gradient-vibrant';
      case 'aurora':
        return 'bg-gradient-aurora';
      case 'mesh':
        return 'bg-gradient-mesh';
      default:
        return 'bg-gradient-subtle';
    }
  };

  return (
    <div className={cn('absolute inset-0 pointer-events-none overflow-hidden z-0', className)}>
      <div className={cn('w-full h-full gpu-accelerated', getGradientClass(), getSpeedClass())} />
    </div>
  );
};
