import { cn } from '@/shared/ui-kit/utils';
import { LoaderCircle } from 'lucide-react';

function AppLoader({
  inverse,
  size = 70,
  className,
}: {
  size?: number;
  inverse?: boolean;
  className?: string;
}) {
  return (
    <LoaderCircle
      color={inverse ? undefined : '#8e51ff'}
      className={cn('animate-spin m-auto', className)}
      size={size}
    />
  );
}

export { AppLoader };
