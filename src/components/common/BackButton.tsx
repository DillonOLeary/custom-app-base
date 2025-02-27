import React from 'react';
import { cn } from '@/utils/classnames';
import Link from 'next/link';

interface BackButtonProps {
  href: string;
  label?: string;
  className?: string;
  testId?: string;
}

/**
 * Reusable back button component matching CEART design
 */
export function BackButton({
  href,
  label = 'Back to Projects',
  className,
  testId = 'back-button',
}: BackButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        'text-[--color-primary] hover:text-[--color-secondary] flex items-center',
        className,
      )}
      data-testid={testId}
    >
      <svg
        className="w-4 h-4 mr-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      <span className="heading-secondary text-3">{label}</span>
    </Link>
  );
}
