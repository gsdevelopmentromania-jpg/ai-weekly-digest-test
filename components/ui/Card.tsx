import { cn } from '@/lib/utils';

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className, children }: CardProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: CardProps): React.JSX.Element {
  return <div className={cn('mb-4', className)}>{children}</div>;
}

export function CardTitle({ className, children }: CardProps): React.JSX.Element {
  return (
    <h3 className={cn('text-lg font-semibold text-gray-900 dark:text-white', className)}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children }: CardProps): React.JSX.Element {
  return <div className={cn('text-gray-600 dark:text-gray-400', className)}>{children}</div>;
}

export function CardFooter({ className, children }: CardProps): React.JSX.Element {
  return (
    <div className={cn('mt-4 flex items-center gap-3', className)}>{children}</div>
  );
}
