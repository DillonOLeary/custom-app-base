import React from 'react';
import { cn } from '@/utils/classnames';

interface ScoreIndicatorProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  className?: string;
}

/**
 * Reusable score indicator component that displays a score with color-coding
 * Simplified to match the existing CEART design
 */
export function ScoreIndicator({
  score,
  maxScore = 100,
  size = 'md',
  showLabel = true,
  className,
}: ScoreIndicatorProps) {
  // Size classes that match CEART design
  const sizeClasses = {
    sm: 'heading-primary heading-3',
    md: 'heading-primary heading-2',
    lg: 'heading-primary heading-1',
    xl: 'heading-primary heading-1 text-4xl',
  };

  // Check if we should show the progress bar
  const showProgressBar = maxScore === 100;

  // Determine bar color based on score
  const getBarColor = () => {
    if (score >= 70) return 'bg-[--color-tertiary-2]';
    if (score >= 40) return 'bg-[--color-tertiary-3]';
    return 'bg-[--color-secondary]';
  };

  return (
    <div className={cn('flex items-center', className)}>
      {showProgressBar && (
        <div className="h-2.5 w-16 bg-[--color-bg-1] rounded-full mr-2">
          <div
            className={cn('h-2.5 rounded-full', getBarColor())}
            style={{ width: `${score}%` }}
          ></div>
        </div>
      )}

      <span
        className={cn(sizeClasses[size], 'text-[--color-primary]')}
        data-testid="score-value"
      >
        {score}
        {maxScore !== 100 && <span className="text-gray-500 mx-1">/</span>}
        {maxScore !== 100 && <span className="text-gray-500">{maxScore}</span>}
      </span>

      {showLabel && (
        <span className="ml-1 text-[--color-bg-3] text-3">
          {maxScore === 100 ? 'Score' : 'Points'}
        </span>
      )}
    </div>
  );
}
