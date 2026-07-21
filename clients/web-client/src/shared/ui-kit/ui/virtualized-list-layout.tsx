'use client';

import { ReactVirtualizer, VirtualItem } from '@tanstack/react-virtual';
import { ReactNode } from 'react';

interface VirtualizedListLayoutProps {
  readonly rowVirtualizer: ReactVirtualizer<HTMLDivElement, Element>;
  readonly renderItem: (item: VirtualItem) => ReactNode;
}

function VirtualizedListLayout({ rowVirtualizer, renderItem }: VirtualizedListLayoutProps) {
  return (
    <div className="relative w-full" style={{ height: rowVirtualizer.getTotalSize() }}>
      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
        return (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: virtualRow.size,
              transform: 'translateY(' + virtualRow.start + 'px)',
            }}
          >
            {renderItem(virtualRow)}
          </div>
        );
      })}
    </div>
  );
}

export { VirtualizedListLayout, type VirtualizedListLayoutProps };
