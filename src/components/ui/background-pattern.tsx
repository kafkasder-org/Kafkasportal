import React, { useId } from 'react';
import { cn } from '@/lib/utils';

interface BackgroundPatternProps {
  variant: 'dots' | 'grid' | 'waves' | 'circuit' | 'topography';
  opacity?: number;
  color?: string;
  className?: string;
}

export const BackgroundPattern: React.FC<BackgroundPatternProps> = ({
  variant,
  opacity = 0.4,
  color = 'currentColor',
  className,
}) => {
  const patternId = useId();
  const uniqueId = `${variant}-pattern-${patternId}`;
  const renderPattern = () => {
    switch (variant) {
      case 'dots':
        return (
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <pattern
                id={uniqueId}
                x="0"
                y="0"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="2" cy="2" r="1.5" fill={color} fillOpacity={opacity} />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${uniqueId})`} />
          </svg>
        );

      case 'grid':
        return (
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <pattern
                id={uniqueId}
                x="0"
                y="0"
                width="24"
                height="24"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 24 0 L 0 0 0 24"
                  fill="none"
                  stroke={color}
                  strokeWidth="1"
                  strokeOpacity={opacity}
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${uniqueId})`} />
          </svg>
        );

      case 'waves':
        return (
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <pattern
                id={uniqueId}
                x="0"
                y="0"
                width="100"
                height="50"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 0 25 Q 25 15, 50 25 T 100 25"
                  fill="none"
                  stroke={color}
                  strokeWidth="1.5"
                  strokeOpacity={opacity}
                />
                <path
                  d="M 0 35 Q 25 25, 50 35 T 100 35"
                  fill="none"
                  stroke={color}
                  strokeWidth="1.5"
                  strokeOpacity={opacity * 0.6}
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${uniqueId})`} />
          </svg>
        );

      case 'circuit':
        return (
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <pattern
                id={uniqueId}
                x="0"
                y="0"
                width="60"
                height="60"
                patternUnits="userSpaceOnUse"
              >
                {/* Horizontal lines */}
                <line
                  x1="0"
                  y1="15"
                  x2="25"
                  y2="15"
                  stroke={color}
                  strokeWidth="1"
                  strokeOpacity={opacity}
                />
                <line
                  x1="35"
                  y1="15"
                  x2="60"
                  y2="15"
                  stroke={color}
                  strokeWidth="1"
                  strokeOpacity={opacity}
                />
                <line
                  x1="0"
                  y1="45"
                  x2="20"
                  y2="45"
                  stroke={color}
                  strokeWidth="1"
                  strokeOpacity={opacity}
                />
                <line
                  x1="40"
                  y1="45"
                  x2="60"
                  y2="45"
                  stroke={color}
                  strokeWidth="1"
                  strokeOpacity={opacity}
                />
                {/* Vertical lines */}
                <line
                  x1="15"
                  y1="0"
                  x2="15"
                  y2="25"
                  stroke={color}
                  strokeWidth="1"
                  strokeOpacity={opacity}
                />
                <line
                  x1="15"
                  y1="35"
                  x2="15"
                  y2="60"
                  stroke={color}
                  strokeWidth="1"
                  strokeOpacity={opacity}
                />
                <line
                  x1="45"
                  y1="0"
                  x2="45"
                  y2="20"
                  stroke={color}
                  strokeWidth="1"
                  strokeOpacity={opacity}
                />
                <line
                  x1="45"
                  y1="40"
                  x2="45"
                  y2="60"
                  stroke={color}
                  strokeWidth="1"
                  strokeOpacity={opacity}
                />
                {/* Circles at intersections */}
                <circle cx="15" cy="15" r="2" fill={color} fillOpacity={opacity} />
                <circle cx="45" cy="45" r="2" fill={color} fillOpacity={opacity} />
                <circle cx="30" cy="30" r="1.5" fill={color} fillOpacity={opacity * 0.7} />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${uniqueId})`} />
          </svg>
        );

      case 'topography':
        return (
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <pattern
                id={uniqueId}
                x="0"
                y="0"
                width="120"
                height="80"
                patternUnits="userSpaceOnUse"
              >
                {/* Contour lines with varying curves */}
                <path
                  d="M 0 20 Q 30 15, 60 20 T 120 20"
                  fill="none"
                  stroke={color}
                  strokeWidth="1"
                  strokeOpacity={opacity}
                />
                <path
                  d="M 0 35 Q 35 30, 70 35 T 120 35"
                  fill="none"
                  stroke={color}
                  strokeWidth="1.2"
                  strokeOpacity={opacity * 0.8}
                />
                <path
                  d="M 0 50 Q 25 45, 50 50 T 120 50"
                  fill="none"
                  stroke={color}
                  strokeWidth="0.8"
                  strokeOpacity={opacity * 0.6}
                />
                <path
                  d="M 0 65 Q 40 58, 80 65 T 120 65"
                  fill="none"
                  stroke={color}
                  strokeWidth="1"
                  strokeOpacity={opacity * 0.7}
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${uniqueId})`} />
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={cn('absolute inset-0 pointer-events-none overflow-hidden z-0', className)}
      aria-hidden="true"
    >
      {renderPattern()}
    </div>
  );
};
