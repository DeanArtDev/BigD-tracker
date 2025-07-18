import { ScrollArea } from '@/shared/ui-kit/ui/scroll-area';
import { cn } from '@/shared/ui-kit/utils';
import { type PropsWithChildren, useEffect, useRef, useState } from 'react';

function AdoptedScrollArea({ children }: PropsWithChildren) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [scrollHeight, setScrollHeight] = useState(0);
  useEffect(() => {
    if (scrollContainerRef.current != null) {
      setScrollHeight(scrollContainerRef.current.clientHeight);
    }
  }, []);

  return (
    <div ref={scrollContainerRef} className={cn('relative flex w-full h-full flex-col')}>
      <div className="flex w-full h-full flex-col" style={{ height: scrollHeight }}>
        <ScrollArea className="h-full">{children}</ScrollArea>
      </div>
    </div>
  );
}

export { AdoptedScrollArea };
