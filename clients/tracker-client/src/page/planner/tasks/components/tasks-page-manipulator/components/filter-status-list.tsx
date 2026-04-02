import { TaskQueryStatus } from '@/entity/planner/tasks';
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
  [TaskQueryStatus.NOT_STARTED]: boolean;
  [TaskQueryStatus.IN_PROGRESS]: boolean;
  [TaskQueryStatus.COMPLETED]: boolean;
  [TaskQueryStatus.OVERDUE]: boolean;
  [TaskQueryStatus.CANCELED]: boolean;
} & Record<string, boolean>;

const humanizeStatusMap: Record<keyof AvailableStatusesMap, string> = {
  [TaskQueryStatus.NOT_STARTED]: 'Не начатые',
  [TaskQueryStatus.IN_PROGRESS]: 'Выполняются',
  [TaskQueryStatus.COMPLETED]: 'Завершенные',
  [TaskQueryStatus.OVERDUE]: 'Просроченные',
  [TaskQueryStatus.CANCELED]: 'Отмененные',
};

interface FilterStatusListProps {
  readonly selectedStatuses: TaskQueryStatus[];
  readonly onFilterChange: (statuses: TaskQueryStatus[]) => void;
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
        [TaskQueryStatus.NOT_STARTED]: false,
        [TaskQueryStatus.IN_PROGRESS]: false,
        [TaskQueryStatus.COMPLETED]: false,
        [TaskQueryStatus.OVERDUE]: false,
        [TaskQueryStatus.CANCELED]: false,
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
                    onFilterChange([...selectedStatuses, status as TaskQueryStatus]);
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
