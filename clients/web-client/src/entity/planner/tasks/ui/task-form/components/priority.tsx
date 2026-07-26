import { TaskPriority } from '@/shared/transport/graphql';
import { cn, ToggleGroupItem, Typography } from '@/shared/ui-kit';
import { ToggleGroupForm } from '@/shared/ui-kit/form';
import { useTaskFormFieldContext } from '../context/task-form-field-provider';

function Priority() {
  const { fieldsState } = useTaskFormFieldContext();
  const { priority } = fieldsState;

  if (priority.hidden) return null;
  return (
    <div className="grid grid-cols-[max-content_1fr] gap-2 items-center">
      <Typography.H6 className="font-medium">Приоритет: </Typography.H6>

      <ToggleGroupForm name="priority" disabled={priority.disabled} isErrorMessage={false}>
        <ToggleGroupItem
          value={TaskPriority.Do}
          size="sm"
          variant="outline"
          className={cn(
            'bg-background rounded-xl border-2',
            'border-(--priority-1)/80 data-[state=on]:bg-(--priority-1) data-[state=on]:text-white',
          )}
        >
          <span className="text-xs">P1</span>
        </ToggleGroupItem>

        <ToggleGroupItem
          value={TaskPriority.Plan}
          size="sm"
          variant="outline"
          className={cn(
            'bg-background rounded-xl border-2',
            'border-(--priority-2)/80 data-[state=on]:bg-(--priority-2) data-[state=on]:text-white',
          )}
        >
          <span className="text-xs">P2</span>
        </ToggleGroupItem>

        <ToggleGroupItem
          value={TaskPriority.Delegate}
          size="sm"
          variant="outline"
          className={cn(
            'bg-background rounded-xl border-2',
            'border-(--priority-3)/80 data-[state=on]:bg-(--priority-3) data-[state=on]:text-white',
          )}
        >
          <span className="text-xs">P3</span>
        </ToggleGroupItem>

        <ToggleGroupItem
          value={TaskPriority.Delete}
          size="sm"
          variant="outline"
          className={cn(
            'bg-background rounded-xl border-2',
            'border-(--priority-4)/80 data-[state=on]:bg-(--priority-4) data-[state=on]:text-white',
          )}
        >
          <span className="text-xs">P4</span>
        </ToggleGroupItem>
      </ToggleGroupForm>
    </div>
  );
}

export { Priority };
