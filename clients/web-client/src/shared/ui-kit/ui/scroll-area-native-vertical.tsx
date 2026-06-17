'use client';

import { CSSProperties, PropsWithChildren, Ref } from 'react';
import { cn } from '@/shared/ui-kit';

interface ScrollAreaNativeVerticalProps extends PropsWithChildren {
  readonly className?: string;
  readonly ref?: Ref<HTMLDivElement>;
  readonly style?: CSSProperties;
}

function Container({ className, children, style, ref }: ScrollAreaNativeVerticalProps) {
  return (
    <div
      ref={ref}
      style={style}
      className={cn(
        'native-vertical-scroll-area min-h-0 max-h-full w-full overflow-x-hidden overflow-y-auto touch-pan-y overscroll-y-contain',
        className,
      )}
    >
      {children}
    </div>
  );
}

function ScrollAreaNativeVertical({ className, children, style, ref }: ScrollAreaNativeVerticalProps) {
  return (
    <Container className={className} ref={ref} style={style}>
      <div className="inline-flex h-max min-h-max w-full flex-nowrap">{children}</div>
    </Container>
  );
}

ScrollAreaNativeVertical.Container = Container;

export { ScrollAreaNativeVertical };
