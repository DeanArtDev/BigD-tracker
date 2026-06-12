'use client';

import { ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { useTaskFromContext } from '@/entity/planner/tasks';
import { Button, cn, Collapsible, CollapsibleContent, CollapsibleTrigger, Typography } from '@/shared/ui-kit';
import { DateAndTimePicker } from './date-and-time-picker';
import { Group } from './group';
import { Priority } from './priority';

function TaskFormParamsSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const { formState } = useTaskFromContext();

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      disabled={formState.disabled}
      className="flex flex-col bg-muted rounded-md"
    >
      <CollapsibleTrigger asChild>
        <Button className="justify-between" variant="ghost">
          <Typography.Muted className="text-xs">Параметры</Typography.Muted>
          <ChevronsUpDown className="stroke-muted-foreground" />
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent
        className={cn(
          'flex flex-col gap-3 px-4 pb-4 pt-2',
          'overflow-hidden',
          'data-[state=open]:animate-collapsible-down',
          'data-[state=closed]:animate-collapsible-up',
        )}
      >
        <Group />

        <Priority />

        <div className="grid grid-cols-2 gap-3">
          <DateAndTimePicker name="startDate" />

          <DateAndTimePicker name="deadline" />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export { TaskFormParamsSettings };
