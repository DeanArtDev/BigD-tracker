import { TaskStatus } from '@/entity/planner/tasks';
import { Button } from '@/shared/ui-kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from '@/shared/ui-kit/ui/dropdown-menu';
import { SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';

type AvailableStatusesMap = {
  [TaskStatus.NOT_STARTED]: boolean;
  [TaskStatus.IN_PROGRESS]: boolean;
  [TaskStatus.COMPLETED]: boolean;
  [TaskStatus.OVERDUE]: boolean;
  [TaskStatus.CANCELLED]: boolean;
} & Record<string, boolean>;

const humanizeStatusMap: Record<keyof AvailableStatusesMap, string> = {
  [TaskStatus.NOT_STARTED]: 'Не начатые',
  [TaskStatus.IN_PROGRESS]: 'Выполняются',
  [TaskStatus.COMPLETED]: 'Завершенные',
  [TaskStatus.OVERDUE]: 'Просроченные',
  [TaskStatus.CANCELLED]: 'Отмененные',
};

interface FilterStatusListProps {
  readonly selectedStatuses: TaskStatus[];
  readonly onFilterChange: (statuses: TaskStatus[]) => void;
}

function FilterStatusList({ selectedStatuses, onFilterChange }: FilterStatusListProps) {
  const statusesData = useMemo<AvailableStatusesMap>(() => {
    return selectedStatuses.reduce<AvailableStatusesMap>(
      (acc, status) => {
        if (acc[status] != null) {
          acc[status] = true;
        }
        return acc;
      },
      {
        [TaskStatus.NOT_STARTED]: false,
        [TaskStatus.IN_PROGRESS]: false,
        [TaskStatus.COMPLETED]: false,
        [TaskStatus.OVERDUE]: false,
        [TaskStatus.CANCELLED]: false,
      },
    );
  }, [selectedStatuses]);

  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={selectedStatuses.length > 0 ? 'default' : 'outline'} size="icon-lg">
          <SlidersHorizontal className="size-6" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="center" className="min-w-[150px]">
        <DropdownMenuGroup>
          {Object.entries(statusesData).map(([status, isChecked]) => {
            return (
              <DropdownMenuCheckboxItem
                key={status}
                checked={isChecked}
                onClick={(evt) => {
                  evt.preventDefault();
                  if (!isChecked) {
                    onFilterChange([...selectedStatuses, status as TaskStatus]);
                  } else {
                    onFilterChange(selectedStatuses.filter((i) => i !== status));
                  }
                }}
              >
                {humanizeStatusMap[status]}
              </DropdownMenuCheckboxItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { FilterStatusList, type FilterStatusListProps };
