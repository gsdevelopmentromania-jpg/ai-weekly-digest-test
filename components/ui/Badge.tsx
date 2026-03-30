import { cn } from '@/lib/utils';
import type { DigestCategory } from '@/types';

const categoryStyles: Record<DigestCategory, string> = {
  research: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  product: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  industry: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  tools: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  policy: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

const categoryLabels: Record<DigestCategory, string> = {
  research: 'Research',
  product: 'Product',
  industry: 'Industry',
  tools: 'Tools',
  policy: 'Policy',
  other: 'Other',
};

interface BadgeProps {
  category: DigestCategory;
  className?: string;
}

export function CategoryBadge({ category, className }: BadgeProps): React.JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        categoryStyles[category],
        className,
      )}
    >
      {categoryLabels[category]}
    </span>
  );
}

interface TagBadgeProps {
  tag: string;
  className?: string;
}

export function TagBadge({ tag, className }: TagBadgeProps): React.JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
        className,
      )}
    >
      #{tag}
    </span>
  );
}
