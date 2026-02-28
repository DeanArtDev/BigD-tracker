import { useInvalidateInbox } from '@/entity/planner/groups';
import { useCreateInboxTask, useInvalidateAllTasks } from '@/entity/planner/tasks';
import { AddTaskInboxDialog } from '@/entity/planner/tasks/ui';

function TaskInboxCreateController() {
  const { createInboxTask, isPending } = useCreateInboxTask();
  const invalidateInbox = useInvalidateInbox();
  const invalidateDiaryTasks = useInvalidateAllTasks();

  return (
    <AddTaskInboxDialog
      loading={isPending}
      onSubmit={(formResult, { close }) => {
        createInboxTask(
          {
            body: {
              data: {
                name: formResult.name,
                description: formResult.description,
                priority: formResult.priority,
                recurrence: {
                  deadline: formResult.deadline,
                },
              },
            },
          },
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
