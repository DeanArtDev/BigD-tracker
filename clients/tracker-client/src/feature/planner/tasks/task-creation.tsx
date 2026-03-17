import { useInvalidateAllGroups } from '@/entity/planner/groups';
import { useCreateTask, useInvalidateAllTasks } from '@/entity/planner/tasks';
import { TaskFormDialog, type TaskFormDialogProps } from '@/entity/planner/tasks/ui';
import type { TaskFormProps } from '@/entity/planner/tasks/ui/form';
import { type ReactNode, useState } from 'react';

interface TaskCreationProps {
  readonly groupId?: number;
  readonly trigger: ReactNode;
  readonly defaultValue?: TaskFormProps['defaultValue'];
  readonly options?: TaskFormDialogProps['options'];
  readonly onSuccess?: () => void;
  readonly onCansel?: () => void;
}

function TaskCreation({ trigger, groupId, options, onSuccess, onCansel }: TaskCreationProps) {
  const [open, setOpen] = useState(false);

  const { createTask, isPending } = useCreateTask();
  const invalidateTasks = useInvalidateAllTasks();
  const invalidateAllGroups = useInvalidateAllGroups();

  return (
    <TaskFormDialog
      open={open}
      loading={isPending}
      trigger={trigger}
      options={options}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        !isOpen && onCansel?.();
      }}
      onSubmit={(formData) => {
        const { isRecurrence: _, ...data } = formData;

        createTask(
          { body: { data: { ...data, groupId } } },

          {
            onSuccess: async () => {
              await invalidateAllGroups();
              await invalidateTasks();
              setOpen(false);
              onSuccess?.();
            },
          },
        );
      }}
    />
  );
}

export { TaskCreation, type TaskCreationProps };
