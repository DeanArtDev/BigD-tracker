import { SortDirection } from '@/shared/lib/constants';
import { Button } from '@/shared/ui-kit/ui/button';
import { ArrowDownNarrowWide, ArrowDownWideNarrow } from 'lucide-react';
import type { PropsWithChildren } from 'react';

interface SortButtonProps {
  readonly className?: string;
  readonly direction: SortDirection | undefined;
  readonly onSortChange: (direction: SortDirection | undefined) => void;
}

function SortButton({
  className,
  children,
  direction,
  onSortChange,
}: PropsWithChildren<SortButtonProps>) {
  return (
    <Button
      className={className}
      variant={direction != null ? 'default' : 'outline'}
      type="button"
      onClick={() => {
        const value = {
          undefined: SortDirection.ASC,
          [SortDirection.ASC]: SortDirection.DESC,
          [SortDirection.DESC]: undefined,
        }[direction ?? 'undefined'];
        onSortChange(value);
      }}
    >
      {children}

      {direction === SortDirection.ASC && <ArrowDownNarrowWide />}
      {direction === SortDirection.DESC && <ArrowDownWideNarrow />}
      {direction == null && <ArrowDownWideNarrow />}
    </Button>
  );
}

export { SortButton, type SortButtonProps };
