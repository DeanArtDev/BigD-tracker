import { cn } from '@/shared/ui-kit/utils';
import { TriangleAlert } from 'lucide-react';

interface AppPlaceholderProps {
  readonly message?: string;
  readonly className?: string;
}

function AppPlaceholder({ className, message = 'Данные отсутствуют' }: AppPlaceholderProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center grow justify-center dark:bg-gray-900 text-center',
        className,
      )}
    >
      <TriangleAlert color="var(--color-yellow-500)" size={50} />

      <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">{message}</p>
    </div>
  );
}

export { AppPlaceholder, type AppPlaceholderProps };
