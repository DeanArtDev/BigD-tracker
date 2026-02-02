import { useGetUserInbox, useInvalidateInbox } from '@/entity/planner/groups';
import { type TaskInboxEntity } from '@/entity/planner/tasks';
import { TaskDeleteWithConfirmHoc } from '@/entity/planner/tasks/ui';
import { withLazy } from '@/shared/lib/react/with-lazy';
import { useIsMobile } from '@/shared/ui-kit/helpers';
import { Button } from '@/shared/ui-kit/ui/button';
import { Skeleton } from '@/shared/ui-kit/ui/skeleton';
import { Trash } from 'lucide-react';
import { useState } from 'react';
import { TaskInboxCreateController } from '../task-inbox-update-controller';

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
  const invalidateInbox = useInvalidateInbox();

  const isMobile = useIsMobile();

  return (
    <>
      <ul className="flex flex-col gap-1 sm:gap-2 justify-center w-full">
        {inbox?.map((i) =>
          isMobile ? (
            <TaskInboxCardMobileLazy
              key={i.id}
              task={i}
              onDeleteSuccess={invalidateInbox}
              onClick={() => setTask(i)}
            />
          ) : (
            <TaskInboxCardLazy
              key={i.id}
              task={i}
              actionsSlot={
                <div
                  className="contents"
                  onClick={(evt) => {
                    evt.stopPropagation();
                  }}
                >
                  <TaskDeleteWithConfirmHoc taskId={i.id} onSuccess={invalidateInbox}>
                    {({ isLoading }) => (
                      <Button
                        size="icon"
                        className="my-auto w-7 h-7 opacity-0 group-hover:opacity-100"
                        variant="ghost"
                        disabled={isLoading}
                        onClick={(evt) => void evt.stopPropagation()}
                      >
                        <Trash />
                      </Button>
                    )}
                  </TaskDeleteWithConfirmHoc>
                </div>
              }
              onClick={() => void setTask(i)}
            />
          ),
        )}
      </ul>

      <TaskInboxCreateController
        inboxTask={task}
        onCancel={() => void setTask(undefined)}
        onSuccess={() => void setTask(undefined)}
      />
    </>
  );
}

export { TaskInboxList };
