'use client';

import { PartialKeys, ReactVirtualizerOptions, useVirtualizer, VirtualItem } from '@tanstack/react-virtual';
import { merge } from 'lodash-es';
import { ReactNode, useRef } from 'react';
import { InfinityScroll, InfinityScrollProps } from './infinity-scroll';
import { VirtualizedListLayout } from './virtualized-list-layout';

interface VirtualizedInfinityScrollProps extends Omit<InfinityScrollProps, 'ref' | 'options'> {
  readonly virtualizerOptions: Omit<
    PartialKeys<
      ReactVirtualizerOptions<HTMLDivElement, Element>,
      'observeElementRect' | 'observeElementOffset' | 'scrollToFn' | 'estimateSize'
    >,
    'getScrollElement'
  >;
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
    ...merge({}, { estimateSize: () => 100 }, virtualizerOptions),
    getScrollElement: () => parentRef.current,
  });

  return (
    <InfinityScroll {...rest} options={infinityScrollOptions} ref={parentRef}>
      <VirtualizedListLayout renderItem={renderItem} rowVirtualizer={rowVirtualizer} />
    </InfinityScroll>
  );
}

export { VirtualizedInfinityScroll, type VirtualizedInfinityScrollProps };
