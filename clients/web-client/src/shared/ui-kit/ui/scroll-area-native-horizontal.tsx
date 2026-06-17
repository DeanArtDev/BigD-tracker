import type { PropsWithChildren } from 'react';
import { cn } from '@/shared/ui-kit';

function ScrollAreaNativeHorizontal({ className, children }: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        'native-horizontal-scroll-area w-full min-w-0 max-w-full overflow-y-hidden overflow-x-auto touch-pan-x overscroll-x-contain',
        className,
      )}
    >
      <div className="inline-flex w-max min-w-max flex-nowrap">{children}</div>
    </div>
  );
}

export { ScrollAreaNativeHorizontal };
