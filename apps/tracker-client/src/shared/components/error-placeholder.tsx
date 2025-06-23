import { Button } from '@/shared/ui-kit/ui/button';
import { CircleAlert } from 'lucide-react';

interface ErrorPlaceholderProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorPlaceholder({
  message = 'Что-то пошло не так 😕',
  onRetry,
}: ErrorPlaceholderProps) {
  return (
    <div className="flex flex-col items-center grow justify-center p-8 bg-gray-50 dark:bg-gray-900 rounded-md shadow-md space-y-4 text-center">
      <CircleAlert color="var(--color-red-500)" size={80} />

      <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">{message}</p>

      {onRetry && (
        <Button variant="default" size="lg" onClick={onRetry}>
          Повторить
        </Button>
      )}
    </div>
  );
}
