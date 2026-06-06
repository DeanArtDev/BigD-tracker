import { LoaderCircle } from 'lucide-react';
import { cn } from '@/shared/ui-kit';

function DataLoadingElement({
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

export { DataLoadingElement };
