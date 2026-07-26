import { Circle } from 'lucide-react';
import { TaskPriority } from '@/shared/transport/graphql';
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
      onValueChange={(val: TaskPriority[]) => void onChange([...new Set(val).values()])}
    >
      <ToggleGroupItem value={TaskPriority.Do} className="w-[30px] data-[state=on]:bg-[var(--priority-1)]/20">
        <Circle strokeWidth={3} color="var(--priority-1)" />
      </ToggleGroupItem>

      <ToggleGroupItem value={TaskPriority.Plan} className="w-[30px] data-[state=on]:bg-[var(--priority-2)]/20">
        <Circle strokeWidth={3} color="var(--priority-2)" />
      </ToggleGroupItem>

      <ToggleGroupItem value={TaskPriority.Delegate} className="w-[30px] data-[state=on]:bg-[var(--priority-3)]/20">
        <Circle strokeWidth={3} color="var(--priority-3)" />
      </ToggleGroupItem>

      <ToggleGroupItem value={TaskPriority.Delete} className="w-[30px] data-[state=on]:bg-[var(--priority-4)]/20">
        <Circle strokeWidth={3} color="var(--priority-4)" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

export { TaskPriorityPicker, type TaskPriorityPickerProps };
