/**
 * Utility for conditionally joining CSS class names together
 * This is similar to the popular 'clsx' or 'classnames' libraries
 *
 * Example usage:
 * cn('base-class', isActive && 'active', size === 'large' && 'large')
 */
export function cn(
  ...classes: (string | boolean | undefined | null)[]
): string {
  return classes.filter(Boolean).join(' ');
}
