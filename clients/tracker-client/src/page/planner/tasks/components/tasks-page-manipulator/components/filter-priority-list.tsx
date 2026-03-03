import { TaskPriority } from '@/entity/planner/tasks';
import { taskPriorityColorMap } from '@/entity/planner/tasks/lib/maps';
import { Button } from '@/shared/ui-kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from '@/shared/ui-kit/ui/dropdown-menu';
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui-kit/ui/toggle-group';
import { isNumber } from 'lodash-es';
import { Circle, Flag } from 'lucide-react';

interface FilterPriorityListProps {
  readonly priority?: TaskPriority;
  readonly onFilterChange: (priority: TaskPriority | undefined) => void;
}

function FilterPriorityList({ priority, onFilterChange }: FilterPriorityListProps) {
  const iconColor = priority != null ? `var(${taskPriorityColorMap[priority]})` : 'var(--foreground)';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon-lg">
          <Flag stroke={iconColor} className="stroke-3 size-5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="center" className="min-w-[44px]">
        <DropdownMenuGroup>
          <ToggleGroup
            value={priority?.toString() ?? ''}
            type="single"
            orientation="vertical"
            onValueChange={(value) => {
              const numericString = parseInt(value, 10);
              onFilterChange(isNumber(numericString) && !Number.isNaN(numericString) ? numericString : undefined);
            }}
          >
            <ToggleGroupItem value={TaskPriority.DO.toString()} asChild>
              <Circle strokeWidth={3} color={`var(${taskPriorityColorMap[TaskPriority.DO]})`} />
            </ToggleGroupItem>

            <ToggleGroupItem value={TaskPriority.PLAN.toString()} asChild>
              <Circle strokeWidth={3} color={`var(${taskPriorityColorMap[TaskPriority.PLAN]})`} />
            </ToggleGroupItem>

            <ToggleGroupItem value={TaskPriority.DELEGATE.toString()} asChild>
              <Circle strokeWidth={3} color={`var(${taskPriorityColorMap[TaskPriority.DELEGATE]})`} />
            </ToggleGroupItem>

            <ToggleGroupItem value={TaskPriority.DELETE.toString()} asChild>
              <Circle strokeWidth={3} color={`var(${taskPriorityColorMap[TaskPriority.DELETE]})`} />
            </ToggleGroupItem>
          </ToggleGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { FilterPriorityList, type FilterPriorityListProps };
