'use client';

import { isFunction } from 'lodash-es';
import { RotateCcw } from 'lucide-react';
import { CSSProperties, type PropsWithChildren, Ref, useCallback, useState } from 'react';
import { useOnInView } from 'react-intersection-observer';
import { Button, DataLoader } from '@/shared/ui-kit';
import { ScrollAreaNativeVertical } from './scroll-area-native-vertical';

interface InfinityScrollProps extends PropsWithChildren {
  readonly ref?: Ref<HTMLDivElement>;
  readonly style?: CSSProperties;
  readonly className?: string;
  readonly hasNextPage: boolean;
  readonly isLoadingNextPage?: boolean;
  readonly isError: boolean;
  readonly options?: {
    readonly bottomGap?: number;
  };
  readonly onNextPageLoad: () => void;
}

function InfinityScroll({
  ref,
  style,
  isLoadingNextPage = false,
  isError,
  children,
  hasNextPage,
  className,
  options,
  onNextPageLoad,
}: InfinityScrollProps) {
  const { bottomGap = 50 } = options ?? {};

  const [root, setRoot] = useState<HTMLDivElement | null>(null);

  const setRootRef = useCallback(
    (node: HTMLDivElement | null) => {
      setRoot(node);

      if (ref != null) {
        if (isFunction(ref)) ref(node);
        else ref.current = node;
      }
    },
    [ref],
  );

  const showLoadMoreButton = isError && !isLoadingNextPage && hasNextPage;

  const trackingRef = useOnInView(
    (inView) => {
      if (inView && !isError) onNextPageLoad();
    },
    {
      trackVisibility: true,
      delay: 100,
      rootMargin: `0px 0px ${bottomGap}px 0px`,
      root,
      skip: isLoadingNextPage || !hasNextPage || isError,
    },
  );

  return (
    <ScrollAreaNativeVertical className={className} style={style} ref={setRootRef}>
      <div className="flex flex-col grow p-[1px]">
        {children}

        <div className="mt-3 flex h-10 shrink-0 items-center justify-center overflow-hidden">
          {showLoadMoreButton ? (
            <Button variant="link" size="sm" type="button" onClick={() => void onNextPageLoad()}>
              Повторить запрос
              <RotateCcw />
            </Button>
          ) : (
            <>{isLoadingNextPage && <DataLoader.Loading size={40} />}</>
          )}
        </div>

        <div className="h-px w-full" ref={trackingRef} />
      </div>
    </ScrollAreaNativeVertical>
  );
}

export { InfinityScroll, type InfinityScrollProps };
