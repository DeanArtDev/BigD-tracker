import type { PropsWithChildren } from 'react';

import { cn } from '@/shared/ui-kit/utils';

function ScrollAreaNativeVertical({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        'native-vertical-scroll-area w-full overflow-x-hidden overflow-y-auto touch-pan-y overscroll-y-contain',
        className,
      )}
    >
      <div className="inline-flex w-full flex-nowrap">{children}</div>
    </div>
  );
}

export { ScrollAreaNativeVertical };
