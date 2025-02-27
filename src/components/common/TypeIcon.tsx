import React from 'react';
import { cn } from '@/utils/classnames';

type ProjectType =
  | 'solar'
  | 'wind'
  | 'hydro'
  | 'biomass'
  | 'geothermal'
  | 'storage'
  | string;

interface TypeIconProps {
  type: ProjectType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

/**
 * Reusable component for displaying project type icons
 * Simplifies to use the same emoji icons as the original design
 */
export function TypeIcon({
  type,
  size = 'md',
  className,
  showLabel = false,
}: TypeIconProps) {
  // Energy type icons - from existing implementation
  const typeIcons: Record<string, string> = {
    solar: '☀️',
    wind: '🌬️',
    hydro: '💧',
    geothermal: '🔥',
    biomass: '🌱',
    other: '⚡',
  };

  // Size classes
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <span className={cn(sizeClasses[size], className)} data-testid="type-icon">
      {typeIcons[type.toLowerCase()] || '⚡'}
      {showLabel && (
        <span className="ml-2">
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </span>
      )}
    </span>
  );
}
