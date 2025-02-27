import React from 'react';
import { cn } from '@/utils/classnames';

type ImpactLevel = 'high' | 'medium' | 'low' | string;

interface ImpactBadgeProps {
  impact: ImpactLevel;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

/**
 * Reusable impact badge component for displaying risk/impact levels
 */
export function ImpactBadge({
  impact,
  className,
  size = 'md',
  showLabel = true,
}: ImpactBadgeProps) {
  const getImpactConfig = (impact: ImpactLevel) => {
    switch (impact.toLowerCase()) {
      case 'high':
        return { bg: 'bg-red-100', text: 'text-red-800', label: 'High' };
      case 'medium':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          label: 'Medium',
        };
      case 'low':
        return { bg: 'bg-green-100', text: 'text-green-800', label: 'Low' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: impact };
    }
  };

  const { bg, text, label } = getImpactConfig(impact);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        bg,
        text,
        sizeClasses[size],
        className,
      )}
      data-testid="impact-badge"
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full mr-1',
          impact.toLowerCase() === 'high'
            ? 'bg-red-500'
            : impact.toLowerCase() === 'medium'
              ? 'bg-yellow-500'
              : impact.toLowerCase() === 'low'
                ? 'bg-green-500'
                : 'bg-gray-500',
        )}
      />
      {showLabel && label}
    </span>
  );
}
