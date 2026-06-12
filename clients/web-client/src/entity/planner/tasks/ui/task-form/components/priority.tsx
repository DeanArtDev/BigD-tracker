import { cn, ToggleGroupItem, Typography } from '@/shared/ui-kit';
import { ToggleGroupForm } from '@/shared/ui-kit/form';

function Priority() {
  return (
    <div className="grid grid-cols-[max-content_1fr] gap-2 items-center">
      <Typography.H6 className="font-medium">Приоритет</Typography.H6>

      <ToggleGroupForm name="priority">
        <ToggleGroupItem
          value="1"
          size="sm"
          variant="outline"
          className={cn(
            'bg-background rounded-xl border-1',
            'border-(--priority-1)/80 data-[state=on]:bg-(--priority-1) data-[state=on]:text-white',
          )}
        >
          <span className="text-xs">P1</span>
        </ToggleGroupItem>

        <ToggleGroupItem
          value="2"
          size="sm"
          variant="outline"
          className={cn(
            'bg-background rounded-xl border-1',
            'border-(--priority-2)/80 data-[state=on]:bg-(--priority-2) data-[state=on]:text-white',
          )}
        >
          <span className="text-xs">P2</span>
        </ToggleGroupItem>

        <ToggleGroupItem
          value="3"
          size="sm"
          variant="outline"
          className={cn(
            'bg-background rounded-xl border-1',
            'border-(--priority-3)/80 data-[state=on]:bg-(--priority-3) data-[state=on]:text-white',
          )}
        >
          <span className="text-xs">P3</span>
        </ToggleGroupItem>

        <ToggleGroupItem
          value="4"
          size="sm"
          variant="outline"
          className={cn(
            'bg-background rounded-xl border-1',
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
