import React, { ReactNode } from 'react';
import { cn } from '@/utils/classnames';

interface ErrorDisplayProps {
  title?: string;
  message: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  testId?: string;
  variant?: 'error' | 'warning' | 'info';
}

/**
 * Reusable error display component for showing error messages with actions
 */
export function ErrorDisplay({
  title,
  message,
  icon,
  action,
  className,
  testId = 'error-display',
  variant = 'error',
}: ErrorDisplayProps) {
  const variantStyles = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      title: 'text-red-800',
      text: 'text-red-700',
      icon: 'text-red-500',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      title: 'text-yellow-800',
      text: 'text-yellow-700',
      icon: 'text-yellow-500',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      title: 'text-blue-800',
      text: 'text-blue-700',
      icon: 'text-blue-500',
    },
  };

  const styles = variantStyles[variant];

  // Default error icon
  const defaultIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      {variant === 'error' && (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      )}
      {variant === 'warning' && (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      )}
      {variant === 'info' && (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      )}
    </svg>
  );

  return (
    <div
      className={cn(
        'rounded-md p-4 border',
        styles.bg,
        styles.border,
        className,
      )}
      data-testid={testId}
    >
      <div className="flex">
        <div className={cn('flex-shrink-0', styles.icon)}>
          {icon || defaultIcon}
        </div>
        <div className="ml-3">
          {title && (
            <h3 className={cn('text-sm font-medium', styles.title)}>{title}</h3>
          )}
          <div className={cn('text-sm', styles.text)}>
            <p>{message}</p>
          </div>
          {action && <div className="mt-4">{action}</div>}
        </div>
      </div>
    </div>
  );
}
