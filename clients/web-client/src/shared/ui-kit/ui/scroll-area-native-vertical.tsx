import type { PropsWithChildren } from 'react';
import { cn } from '@/shared/ui-kit';

function Container({ className, children }: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        'native-vertical-scroll-area w-full overflow-x-hidden overflow-y-auto touch-pan-y overscroll-y-contain',
        className,
      )}
    >
      {children}
    </div>
  );
}

function ScrollAreaNativeVertical({ className, children }: PropsWithChildren<{ className?: string }>) {
  return (
    <Container className={className}>
      <div className="inline-flex w-full flex-nowrap">{children}</div>
    </Container>
  );
}

ScrollAreaNativeVertical.Container = Container;

export { ScrollAreaNativeVertical };
