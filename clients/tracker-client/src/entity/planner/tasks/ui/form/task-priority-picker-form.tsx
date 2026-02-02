import { ToggleGroupForm } from '@/shared/components/form';
import { ToggleGroupItem } from '@/shared/ui-kit/ui/toggle-group';
import { Circle } from 'lucide-react';

function TaskPriorityPickerForm() {
  return (
    <ToggleGroupForm name="priority" tabIndex={-1} label="Приоритет">
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
    </ToggleGroupForm>
  );
}

export { TaskPriorityPickerForm };
