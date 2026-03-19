import { useInvalidateInbox } from '@/entity/planner/groups';
import { useCreateInboxTask, useInvalidateAllTasks } from '@/entity/planner/tasks';
import { TaskFormDialog } from '@/entity/planner/tasks/ui';
import { Button } from '@/shared/ui-kit/ui/button';
import { cn } from '@/shared/ui-kit/utils';
import { Plus } from 'lucide-react';
import { useState } from 'react';

function TaskInboxCreateController() {
  const [open, setOpen] = useState(false);

  const { createInboxTask, isPending } = useCreateInboxTask();
  const invalidateInbox = useInvalidateInbox();
  const invalidateDiaryTasks = useInvalidateAllTasks();

  return (
    <TaskFormDialog
      open={open}
      loading={isPending}
      trigger={
        <Button
          size="icon"
          className={cn('absolute bottom-5 sm:bottom-7 right-5 sm:right-5 rounded-full p-6 z-49', {
            'sm:-right-15': open,
          })}
        >
          <Plus className="size-6" />
        </Button>
      }
      options={{ visibility: { recurrence: false, weight: false } }}
      onOpenChange={setOpen}
      onSubmit={(formData) => {
        const { isRecurrence: _, weight: __, ...data } = formData;

        createInboxTask(
          { body: { data } },
          {
            onSuccess: async () => {
              await invalidateDiaryTasks();
              await invalidateInbox();
              setOpen(false);
            },
          },
        );
      }}
    />
  );
}

export { TaskInboxCreateController };
