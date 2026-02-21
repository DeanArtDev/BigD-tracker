import { TasksQueryStatus } from '@/entity/planner/tasks';
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
  [TasksQueryStatus.NOT_STARTED]: boolean;
  [TasksQueryStatus.IN_PROGRESS]: boolean;
  [TasksQueryStatus.COMPLETED]: boolean;
  [TasksQueryStatus.OVERDUE]: boolean;
  [TasksQueryStatus.CANCELLED]: boolean;
} & Record<string, boolean>;

const humanizeStatusMap: Record<keyof AvailableStatusesMap, string> = {
  [TasksQueryStatus.NOT_STARTED]: 'Не начатые',
  [TasksQueryStatus.IN_PROGRESS]: 'Выполняются',
  [TasksQueryStatus.COMPLETED]: 'Завершенные',
  [TasksQueryStatus.OVERDUE]: 'Просроченные',
  [TasksQueryStatus.CANCELLED]: 'Отмененные',
};

interface FilterStatusListProps {
  readonly selectedStatuses: TasksQueryStatus[];
  readonly onFilterChange: (statuses: TasksQueryStatus[]) => void;
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
        [TasksQueryStatus.NOT_STARTED]: false,
        [TasksQueryStatus.IN_PROGRESS]: false,
        [TasksQueryStatus.COMPLETED]: false,
        [TasksQueryStatus.OVERDUE]: false,
        [TasksQueryStatus.CANCELLED]: false,
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
                    onFilterChange([...selectedStatuses, status as TasksQueryStatus]);
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
