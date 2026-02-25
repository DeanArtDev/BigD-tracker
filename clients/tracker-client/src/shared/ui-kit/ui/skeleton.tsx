import { cn } from '@/shared/ui-kit/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-gray-200 rounded-md animate-pulse', className)}
      {...props}
    />
  );
}

export { Skeleton };
