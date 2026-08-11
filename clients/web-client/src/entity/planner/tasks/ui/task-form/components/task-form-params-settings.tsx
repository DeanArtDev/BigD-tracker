'use client';

import { ChevronsUpDown } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { Button, cn, Collapsible, CollapsibleContent, CollapsibleTrigger, Typography } from '@/shared/ui-kit';
import { DateAndTimePicker } from './date-and-time-picker';
import { Priority } from './priority';
import { TaskFromRecurrence } from './task-from-recurrence';
import { TaskStatusIndication } from '../../task-status-indication';
import { useTaskFormFieldContext } from '../context/task-form-field-provider';
import { useTaskFromContext } from '../context/task-form-provider';

function TaskFormParamsSettings({ groupSlot }: { groupSlot?: ReactNode }) {
  const { fieldsState, blockState } = useTaskFormFieldContext();
  const {
    params: { collapsed },
  } = blockState;
  const [isOpen, setIsOpen] = useState(!collapsed);
  const { formState, getValues } = useTaskFromContext();
  const { startDate, deadline, recurrence } = fieldsState;

  const taskStatus = getValues('status');

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      disabled={formState.disabled}
      className="flex flex-col bg-muted rounded-md"
    >
      <CollapsibleTrigger asChild>
        <Button className="gap-2" variant="ghost">
          <Typography.Muted className="text-xs mr-auto">Параметры</Typography.Muted>

          {taskStatus != null && <TaskStatusIndication status={taskStatus} />}
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
        <div className="grid grid-cols-2 gap-3 justify-between">
          <Priority />

          {groupSlot}
        </div>

        {(!deadline.hidden || !startDate.hidden) && (
          <div className="grid grid-cols-2 gap-3">
            {!startDate.hidden && (
              <DateAndTimePicker disabled={startDate.disabled} clearable={startDate?.clearable} name="startDate" />
            )}

            {!deadline.hidden && (
              <DateAndTimePicker disabled={deadline.disabled} clearable={startDate?.clearable} name="deadline" />
            )}
          </div>
        )}

        {!recurrence.hidden && <TaskFromRecurrence />}
      </CollapsibleContent>
    </Collapsible>
  );
}

export { TaskFormParamsSettings };
