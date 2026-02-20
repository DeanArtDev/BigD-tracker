import { useInvalidateInbox } from '@/entity/planner/groups';
import { useCreateInboxTask, useInvalidateTasks } from '@/entity/planner/tasks';
import { AddTaskInboxDialog } from '@/entity/planner/tasks/ui';

function TaskInboxCreateController() {
  const { createInboxTask, isPending } = useCreateInboxTask();
  const invalidateInbox = useInvalidateInbox();
  const invalidateDiaryTasks = useInvalidateTasks();

  return (
    <AddTaskInboxDialog
      loading={isPending}
      onSubmit={(formResult, { close }) => {
        createInboxTask(
          { body: { data: formResult } },
          {
            onSuccess: async () => {
              await invalidateDiaryTasks();
              await invalidateInbox();
              close();
            },
          },
        );
      }}
    />
  );
}

export { TaskInboxCreateController };
