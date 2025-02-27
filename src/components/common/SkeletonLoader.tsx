import React from 'react';
import { cn } from '@/utils/classnames';

interface SkeletonProps {
  className?: string;
  height?: string;
  width?: string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  animate?: boolean;
}

interface SkeletonTextProps extends SkeletonProps {
  lines?: number;
  lastLineWidth?: string;
}

interface SkeletonCardProps extends SkeletonProps {
  header?: boolean;
  footer?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Basic skeleton loader component for loading states
 */
export function Skeleton({
  className,
  height = 'h-4',
  width = 'w-full',
  rounded = 'md',
  animate = true,
}: SkeletonProps) {
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  return (
    <div
      className={cn(
        'bg-gray-200',
        height,
        width,
        roundedClasses[rounded],
        animate && 'animate-pulse',
        className,
      )}
      data-testid="skeleton-loader"
    />
  );
}

/**
 * Text skeleton with multiple lines
 */
export function SkeletonText({
  lines = 3,
  lastLineWidth = '75%',
  className,
  height = 'h-4',
  rounded = 'md',
  animate = true,
}: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height={height}
          width={index === lines - 1 ? lastLineWidth : 'w-full'}
          rounded={rounded}
          animate={animate}
        />
      ))}
    </div>
  );
}

/**
 * Card skeleton for project cards, etc.
 */
export function SkeletonCard({
  className,
  header = true,
  footer = false,
  padding = 'md',
  rounded = 'md',
  animate = true,
}: SkeletonCardProps) {
  // Padding classes
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  };

  // Border radius classes
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  return (
    <div
      className={cn(
        'bg-white border border-gray-200 shadow-sm',
        paddingClasses[padding],
        roundedClasses[rounded],
        className,
      )}
      data-testid="skeleton-card"
    >
      {header && (
        <div className="mb-4">
          <Skeleton height="h-6" width="50%" animate={animate} />
        </div>
      )}

      <div className="space-y-4">
        <SkeletonText lines={2} animate={animate} />
        <Skeleton height="h-20" animate={animate} />
      </div>

      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Skeleton height="h-8" width="30%" animate={animate} />
        </div>
      )}
    </div>
  );
}
