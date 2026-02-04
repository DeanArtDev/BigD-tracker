import { AppLoader } from '@/shared/ui-kit/ui/app-loader';
import { debounce } from 'lodash-es';
import { type PropsWithChildren, useEffect, useEffectEvent, useRef } from 'react';

interface InfinityScroll {
  readonly hasNextPage: boolean;
  readonly isLoadingNextPage: boolean;
  readonly options?: {
    readonly bottomGap?: number;
  };
  readonly onNextPageLoad: () => void;
}

function InfinityScroll({
  isLoadingNextPage,
  children,
  hasNextPage,
  options,
  onNextPageLoad,
}: PropsWithChildren<InfinityScroll>) {
  const { bottomGap = 50 } = options ?? {};

  const loaderRef = useRef<HTMLDivElement | null>(null);
  const lastEntryRef = useRef<IntersectionObserverEntry | null>(null);

  const onBottomIntersectEvent = useEffectEvent(() => {
    if (!hasNextPage) return;
    if (isLoadingNextPage) return;
    if (!lastEntryRef.current?.isIntersecting) return;
    onNextPageLoad();
  });

  useEffect(onBottomIntersectEvent);

  useEffect(() => {
    if (!loaderRef.current) return;
    const debouncedIntersect = debounce(onBottomIntersectEvent, 100);

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          debouncedIntersect();
        }
        lastEntryRef.current = entry;
      },
      { rootMargin: `0px 0px ${bottomGap}px 0px` },
    );
    observer.observe(loaderRef.current);

    return () => {
      debouncedIntersect.cancel();
      observer.disconnect();
      if (loaderRef.current) observer.unobserve(loaderRef.current);
      loaderRef.current = null;
    };
  }, [bottomGap]);

  return (
    <div className="h-fit w-full">
      {children}

      {isLoadingNextPage && <AppLoader className="mt-3" size={40} />}
      <div className="h-px" ref={loaderRef} />
    </div>
  );
}

export { InfinityScroll };
