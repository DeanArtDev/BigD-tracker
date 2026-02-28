import { useInvalidateAllGroups } from '@/entity/planner/groups';
import { useCreateTask, useInvalidateAllTasks } from '@/entity/planner/tasks';
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
  const invalidateTasks = useInvalidateAllTasks();
  const invalidateAllGroups = useInvalidateAllGroups();

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
              data: {
                name: formData.name,
                description: formData.description,
                priority: formData.priority,
                weight: formData.weight,
                groupId,
                recurrence: {
                  deadline: formData.deadline,
                  startDate: formData.startDate,
                },
              },
            },
          },

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
