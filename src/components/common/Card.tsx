import React, { ReactNode } from 'react';
import { cn } from '@/utils/classnames';

export interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  shadow?: boolean;
  border?: boolean;
  testId?: string;
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

/**
 * Simple card component matching CEART design with header, body, and footer
 */
export function Card({
  children,
  className,
  onClick,
  hover = true,
  shadow = true,
  border = true,
  testId = 'card',
}: CardProps) {
  return (
    <div
      className={cn(
        'ceart-card p-6',
        hover && 'hover:shadow-lg transition-shadow',
        shadow && 'shadow-sm',
        border && 'border-2 border-[--color-bg-1]',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
      data-testid={testId}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, actions }: CardHeaderProps) {
  return (
    <div
      className={cn('flex items-center justify-between mb-4', className)}
      data-testid="card-header"
    >
      <div>{children}</div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function CardBody({ children, className }: CardBodyProps) {
  return (
    <div className={cn(className)} data-testid="card-body">
      {children}
    </div>
  );
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn('mt-auto pt-4', className)} data-testid="card-footer">
      {children}
    </div>
  );
}
