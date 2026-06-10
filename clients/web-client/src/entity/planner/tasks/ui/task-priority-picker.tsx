import { Circle } from 'lucide-react';
import { TaskPriority } from '@/entity/planner/tasks';
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui-kit';

interface TaskPriorityPickerProps {
  readonly value?: TaskPriority[] | undefined;
  readonly defaultValue?: TaskPriority[] | undefined;
  readonly onChange: (values: TaskPriority[]) => void;
  readonly className?: string;
}

function TaskPriorityPicker({ value, className, onChange }: TaskPriorityPickerProps) {
  return (
    <ToggleGroup
      type="multiple"
      spacing={0}
      className={className}
      value={value?.map(String)}
      defaultValue={value?.map(String)}
      variant="default"
      onValueChange={(val) => {
        onChange([...new Set(val.map((v) => Number(v) as TaskPriority)).values()]);
      }}
    >
      <ToggleGroupItem value="1" className="w-[30px] data-[state=on]:bg-[var(--priority-1)]/20">
        <Circle strokeWidth={3} color="var(--priority-1)" />
      </ToggleGroupItem>

      <ToggleGroupItem value="2" className="w-[30px] data-[state=on]:bg-[var(--priority-2)]/20">
        <Circle strokeWidth={3} color="var(--priority-2)" />
      </ToggleGroupItem>

      <ToggleGroupItem value="3" className="w-[30px] data-[state=on]:bg-[var(--priority-3)]/20">
        <Circle strokeWidth={3} color="var(--priority-3)" />
      </ToggleGroupItem>

      <ToggleGroupItem value="4" className="w-[30px] data-[state=on]:bg-[var(--priority-4)]/20">
        <Circle strokeWidth={3} color="var(--priority-4)" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

export { TaskPriorityPicker, type TaskPriorityPickerProps };
