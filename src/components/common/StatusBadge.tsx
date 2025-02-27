import React from 'react';
import { ProjectStatus, FileStatus } from '@/types/project';
import { cn } from '@/utils/classnames';

type StatusType = ProjectStatus | FileStatus | string;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Reusable status badge component that displays a colored badge
 * for different status types (project, file, etc.)
 */
export function StatusBadge({
  status,
  className,
  size = 'md',
}: StatusBadgeProps) {
  // Status colors using CEART brand colors - matching existing implementation
  const statusColors: Record<string, string> = {
    new: 'bg-[--color-bg-2] text-[--color-text-light]',
    pending: 'bg-[--color-tertiary-3] text-[--color-neutral-5]',
    analyzing: 'bg-[--color-tertiary-1] text-[--color-neutral-3]',
    completed: 'bg-[--color-tertiary-2] text-[--color-neutral-4]',
    failed: 'bg-[--color-secondary] text-[--color-text-light]',
    processing: 'bg-[--color-tertiary-1] text-[--color-neutral-3]',
  };

  // Ensure first letter is capitalized
  const displayLabel = status.charAt(0).toUpperCase() + status.slice(1);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  return (
    <span
      className={cn(
        'ceart-score-badge',
        statusColors[status.toLowerCase()] ||
          'bg-[--color-bg-2] text-[--color-text-light]',
        sizeClasses[size],
        className,
      )}
      data-testid="status-badge"
    >
      {displayLabel}
    </span>
  );
}
