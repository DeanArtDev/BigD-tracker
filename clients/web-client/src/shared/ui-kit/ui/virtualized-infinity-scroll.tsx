'use client';

import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual';
import { ReactNode, useRef } from 'react';
import { InfinityScroll, InfinityScrollProps } from './infinity-scroll';

interface VirtualizedInfinityScrollProps extends Omit<InfinityScrollProps, 'ref' | 'options'> {
  readonly virtualizerOptions: {
    readonly count: number;
    readonly gap?: number;
    readonly overscan?: number;
  };
  readonly infinityScrollOptions?: InfinityScrollProps['options'];
  readonly renderItem: (item: VirtualItem) => ReactNode;
}

function VirtualizedInfinityScroll({
  infinityScrollOptions,
  virtualizerOptions,
  renderItem,
  ...rest
}: VirtualizedInfinityScrollProps) {
  const parentRef = useRef<HTMLDivElement | null>(null);

  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    ...virtualizerOptions,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
  });

  return (
    <InfinityScroll {...rest} options={infinityScrollOptions} ref={parentRef}>
      <div className="relative w-full" style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          return (
            <div
              key={virtualItem.key}
              ref={rowVirtualizer.measureElement}
              data-index={virtualItem.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {renderItem(virtualItem)}
            </div>
          );
        })}
      </div>
    </InfinityScroll>
  );
}

export { VirtualizedInfinityScroll, type VirtualizedInfinityScrollProps };
