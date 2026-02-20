import { useInvalidateInbox } from '@/entity/planner/groups';
import { useCreateTask, useInvalidateTasks } from '@/entity/planner/tasks';
import { AddTaskInboxDialog } from '@/entity/planner/tasks/ui';

function AddDailyThing() {
  const { createTask, isPending } = useCreateTask();
  const invalidateInbox = useInvalidateInbox();
  const invalidateThings = useInvalidateTasks();

  return (
    <AddTaskInboxDialog
      loading={isPending}
      onSubmit={(formResult, { close }) => {
        createTask(
          { body: { data: formResult } },
          {
            onSuccess: async () => {
              await invalidateInbox();
              await invalidateThings();
              close();
            },
          },
        );
      }}
    />
  );
}

export { AddDailyThing };
