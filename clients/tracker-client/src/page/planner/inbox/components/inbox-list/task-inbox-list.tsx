import { useGetUserInbox, useInvalidateInbox } from '@/entity/planner/groups';
import {
  type TaskInboxEntity,
  useDeleteTask,
  useTaskFinish,
  useInvalidateDiaryTasks,
} from '@/entity/planner/tasks';
import { withLazy } from '@/shared/lib/react/with-lazy';
import { useConfirmDialog, useIsMobile } from '@/shared/ui-kit/helpers';
import { Skeleton } from '@/shared/ui-kit/ui/skeleton';
import { useState } from 'react';
import { TaskInboxUpdateController } from '../task-inbox-update-controller';
import { InboxCardActions } from './inbox-card-actions';

const TaskInboxCardMobileLazy = withLazy(
  () =>
    import('./task-inbox-card-mobile').then((m) => ({
      default: m.TaskInboxCardMobile,
    })),
  <Skeleton className="h-10 w-full rounded-md" />,
);

const TaskInboxCardLazy = withLazy(
  () =>
    import('./task-inbox-card').then((m) => ({
      default: m.TaskInboxCard,
    })),
  <Skeleton className="h-10 w-full rounded-md" />,
);

function TaskInboxList() {
  const { inbox } = useGetUserInbox();

  const [task, setTask] = useState<TaskInboxEntity>();

  const { confirmHolder, viaConfirmation } = useConfirmDialog();
  const isMobile = useIsMobile();

  const invalidateInbox = useInvalidateInbox();
  const invalidateDiaryTasks = useInvalidateDiaryTasks();
  const invalidate = async () => {
    await invalidateDiaryTasks();
    await invalidateInbox();
  };

  const { deleteTask, isPending: isDeletePending } = useDeleteTask();
  const { finishTask, isPending: isFinishPending } = useTaskFinish();
  const isLoading = isDeletePending || isFinishPending;

  const handleFinish = (taskId: number) => {
    finishTask({ params: { path: { taskId } } }, { onSuccess: invalidate });
  };

  const handleDelete = (taskId: number) => {
    viaConfirmation({
      isNeedConfirm: () => true,
      callback: () => void deleteTask({ params: { path: { taskId } } }, { onSuccess: invalidate }),
      dialog: {
        title: 'Удалить?',
        content: 'В будущем, дело можно будет восстановить',
      },
    });
  };

  const [swipedTaskId, setSwipedTaskId] = useState<number>();

  return (
    <>
      <ul className="flex flex-col gap-1 sm:gap-2 justify-center w-full">
        {inbox?.map((i) =>
          isMobile ? (
            <TaskInboxCardMobileLazy
              key={i.id}
              task={i}
              loading={isLoading}
              openId={swipedTaskId}
              setOpenId={setSwipedTaskId}
              onClick={() => setTask(i)}
              onFinish={() => handleFinish(i.id)}
              onDelete={() => handleDelete(i.id)}
            />
          ) : (
            <TaskInboxCardLazy
              key={i.id}
              task={i}
              actionsSlot={
                <InboxCardActions
                  className="opacity-0 group-hover/task-frame:opacity-100"
                  loading={isLoading}
                  onFinish={() => handleFinish(i.id)}
                  onDelete={() => handleDelete(i.id)}
                />
              }
              onClick={() => void setTask(i)}
            />
          ),
        )}
      </ul>

      <TaskInboxUpdateController
        inboxTask={task}
        onCancel={() => void setTask(undefined)}
        onSuccess={() => void setTask(undefined)}
      />
      {confirmHolder}
    </>
  );
}

export { TaskInboxList };
