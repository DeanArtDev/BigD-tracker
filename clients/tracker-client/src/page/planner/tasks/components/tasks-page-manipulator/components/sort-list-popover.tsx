import { SortButton } from './sort-button';
import type { SortDirection } from '@/shared/lib/constants';
import { Button } from '@/shared/ui-kit/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui-kit/ui/popover';
import { ArrowDownNarrowWide } from 'lucide-react';

interface SortListPopoverProps {
  readonly sort?: {
    readonly deadline?: SortDirection;
    readonly startDate?: SortDirection;
    readonly priority?: SortDirection;
  };
  readonly onSortChange: (sort: SortListPopoverProps['sort']) => void;
}

function SortListPopover({ sort, onSortChange }: SortListPopoverProps) {
  const { deadline, startDate, priority } = sort ?? {};

  const isNoOne = [deadline, startDate, priority].every((i) => i == null);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={isNoOne ? 'outline' : 'default'} size="icon-lg">
          <ArrowDownNarrowWide className="size-6" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-auto p-0.5">
        <ul className="flex flex-col flex-nowrap gap-2 p-1.5">
          <li>
            <SortButton
              className="flex-inline justify-between w-full text-left"
              direction={startDate}
              onSortChange={(direction) => {
                onSortChange({ ...sort, startDate: direction });
              }}
            >
              Начало
            </SortButton>
          </li>

          <li>
            <SortButton
              className="flex-inline justify-between w-full text-left"
              direction={deadline}
              onSortChange={(direction) => {
                onSortChange({ ...sort, deadline: direction });
              }}
            >
              Дедлайн
            </SortButton>
          </li>

          <li>
            <SortButton
              className="flex-inline justify-between w-full text-left"
              direction={priority}
              onSortChange={(direction) => {
                onSortChange({ ...sort, priority: direction });
              }}
            >
              Приоритет
            </SortButton>
          </li>
        </ul>
      </PopoverContent>
    </Popover>
  );
}

export { SortListPopover, type SortListPopoverProps };
