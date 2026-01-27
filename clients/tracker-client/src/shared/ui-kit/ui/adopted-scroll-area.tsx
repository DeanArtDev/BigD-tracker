import { useContainerSizeObserver } from '@/shared/ui-kit/helpers';
import { ScrollArea } from '@/shared/ui-kit/ui/scroll-area';
import { cn } from '@/shared/ui-kit/utils';
import { type PropsWithChildren } from 'react';

function AdoptedScrollArea({ children }: PropsWithChildren) {
  const { ref: scrollContainerRef, height } = useContainerSizeObserver<HTMLDivElement>();

  return (
    <div ref={scrollContainerRef} className={cn('relative flex w-full h-full flex-col')}>
      <div className="flex w-full h-full flex-col" style={{ height }}>
        <ScrollArea className="h-full">{children}</ScrollArea>
      </div>
    </div>
  );
}

export { AdoptedScrollArea };
