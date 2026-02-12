import { useInvalidateGroups } from '@/entity/planner/groups';
import { useCreateTask, useInvalidateDiaryTasks } from '@/entity/planner/tasks';
import { TaskFormDialog } from '@/entity/planner/tasks/ui';
import { type ReactNode, useState } from 'react';

interface TaskCreationProps {
  readonly groupId?: number;
  readonly trigger: ReactNode;
  readonly onSuccess?: () => void;
  readonly onCansel?: () => void;
}

function TaskCreation({ trigger, groupId, onSuccess, onCansel }: TaskCreationProps) {
  const [open, setOpen] = useState(false);

  const { createTask, isPending } = useCreateTask();
  const invalidateTasks = useInvalidateDiaryTasks();
  const invalidateGroups = useInvalidateGroups();

  return (
    <TaskFormDialog
      open={open}
      loading={isPending}
      defaultValue={{ startDate: new Date() }}
      trigger={trigger}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        !isOpen && onCansel?.();
      }}
      onSubmit={(formData) => {
        createTask(
          {
            body: {
              data: { ...formData, groupId },
            },
          },

          {
            onSuccess: async () => {
              await invalidateGroups();
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
