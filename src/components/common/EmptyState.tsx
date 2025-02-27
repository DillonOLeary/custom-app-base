import React, { ReactNode } from 'react';
import { cn } from '@/utils/classnames';

interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  testId?: string;
}

/**
 * Reusable empty state component for displaying empty lists, search results, etc.
 */
export function EmptyState({
  title,
  message,
  icon,
  action,
  className,
  testId = 'empty-state',
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center',
        className,
      )}
      data-testid={testId}
    >
      {icon && <div className="text-gray-400 mb-4">{icon}</div>}

      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>

      {message && (
        <p className="text-sm text-gray-500 mb-4 max-w-md">{message}</p>
      )}

      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
