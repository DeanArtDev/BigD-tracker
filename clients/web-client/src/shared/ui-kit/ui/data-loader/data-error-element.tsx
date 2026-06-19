'use client';

import { CircleAlert } from 'lucide-react';
import { cn } from '@/shared/ui-kit';
import { Button } from '../button';

interface ErrorPlaceholderProps {
  readonly message?: string;
  readonly className?: string;
  readonly variant?: 'transparent' | 'default';
  readonly size?: 'full' | 'default';
  readonly onRetry?: () => void;
}

function DataErrorElement({
  variant = 'default',
  size = 'default',
  message = 'Что-то пошло не так 😕',
  className,
  onRetry,
}: ErrorPlaceholderProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900 rounded-md shadow-md space-y-4 text-center',
        {
          'bg-transparent': variant === 'transparent',
          'grow w-full h-full': size === 'full',
        },
        className,
      )}
    >
      <CircleAlert color="var(--color-red-500)" size={80} />

      <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">{message}</p>

      {onRetry && (
        <Button variant="default" size="lg" onClick={() => onRetry?.()}>
          Повторить
        </Button>
      )}
    </div>
  );
}

export { DataErrorElement };
