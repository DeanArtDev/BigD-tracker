'use client';

import { isFunction } from 'lodash-es';
import { CSSProperties, type PropsWithChildren, Ref, useRef } from 'react';
import { useOnInView } from 'react-intersection-observer';
import { DataLoader } from '@/shared/ui-kit';
import { ScrollAreaNativeVertical } from './scroll-area-native-vertical';

interface InfinityScrollProps extends PropsWithChildren {
  readonly ref?: Ref<HTMLDivElement>;
  readonly style?: CSSProperties;
  readonly className?: string;
  readonly hasNextPage: boolean;
  readonly isLoadingNextPage?: boolean;
  readonly options?: {
    readonly bottomGap?: number;
  };
  readonly onNextPageLoad: () => void;
}

function InfinityScroll({
  ref,
  style,
  isLoadingNextPage = false,
  children,
  hasNextPage,
  className,
  options,
  onNextPageLoad,
}: InfinityScrollProps) {
  const { bottomGap = 50 } = options ?? {};

  const rootRef = useRef<HTMLDivElement | null>(null);

  const trackingRef = useOnInView(
    (inView) => {
      if (!hasNextPage || isLoadingNextPage) return;
      if (inView) onNextPageLoad();
    },
    {
      trackVisibility: true,
      delay: 100,
      rootMargin: `0px 0px ${bottomGap}px 0px`,
      root: rootRef.current,
    },
  );

  return (
    <ScrollAreaNativeVertical
      className={className}
      style={style}
      ref={(node) => {
        rootRef.current = node;
        if (ref != null) {
          if (isFunction(ref)) ref(node);
          else ref.current = node;
        }
      }}
    >
      <div className="flex flex-col grow p-[1px]">
        {children}

        {isLoadingNextPage && <DataLoader.Loading className="mt-3" size={40} />}
        <div className="h-px w-full" ref={trackingRef} />
      </div>
    </ScrollAreaNativeVertical>
  );
}

export { InfinityScroll, type InfinityScrollProps };
