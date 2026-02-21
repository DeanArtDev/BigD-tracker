import type { TaskEntity } from '@/entity/planner/tasks';
import { AppEmptyPlaceholder } from '@/shared/components/app-empty-placeholder';
import { withLazy } from '@/shared/lib/react/with-lazy';
import { useIsMobile } from '@/shared/ui-kit/helpers';
import { DataLoader } from '@/shared/ui-kit/ui/data-loader';
import { ScrollAreaNativeVertical } from '@/shared/ui-kit/ui/scroll-area-native-vertical';
import { Skeleton } from '@/shared/ui-kit/ui/skeleton';
import { useState } from 'react';
import { TaskCardActions } from './task-card-actions';

const TaskCardSkeleton = () => <Skeleton className="h-[50px] w-full rounded-md shadow-md" />;

const TaskCardMobileLazy = withLazy(
  () => import('./task-card-mobile').then((m) => ({ default: m.TaskCardMobile })),
  <TaskCardSkeleton />,
);

const TaskCardLazy = withLazy(
  () => import('./task-card').then((m) => ({ default: m.TaskCard })),
  <TaskCardSkeleton />,
);

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-3 px-1">
      {new Array(12).fill(0).map((_, index) => (
        <TaskCardSkeleton key={index} />
      ))}
    </div>
  );
}

interface TaskListProps {
  readonly tasks: TaskEntity[];
  readonly loading?: boolean;
  readonly initialLoading?: boolean;
  readonly onClick: (task: TaskEntity) => void;
  readonly onFinish: (task: TaskEntity) => void;
  readonly onDelete: (task: TaskEntity) => void;
}

function TaskList({
  tasks,
  initialLoading = false,
  loading = false,
  onClick,
  onDelete,
  onFinish,
}: TaskListProps) {
  const isMobile = useIsMobile();
  const [swipedTaskId, setSwipedTaskId] = useState<number>();

  return (
    <ScrollAreaNativeVertical className="px-2 py-2 lg:py-4">
      <ul className="flex flex-col gap-1.5 sm:gap-2 justify-center h-full min-h-0 w-full pb-18">
        <DataLoader
          parallelMount
          isLoading={initialLoading}
          loadingElement={<LoadingSkeleton />}
          isEmpty={tasks.length <= 0}
          emptyElement={<AppEmptyPlaceholder message="Дела не найдены." />}
        >
          {tasks.map((task) =>
            isMobile ? (
              <TaskCardMobileLazy
                key={task.id}
                task={task}
                loading={loading}
                openId={swipedTaskId}
                setOpenId={setSwipedTaskId}
                onClick={() => onClick(task)}
                onFinish={() => onFinish(task)}
                onDelete={() => onDelete(task)}
              />
            ) : (
              <TaskCardLazy
                key={task.id}
                task={task}
                actionsSlot={
                  <TaskCardActions
                    taskStatus={task.status}
                    className="opacity-0 group-hover/task-frame:opacity-100"
                    loading={loading}
                    onFinish={() => onFinish(task)}
                    onDelete={() => onDelete(task)}
                  />
                }
                onClick={() => onClick(task)}
              />
            ),
          )}
        </DataLoader>
      </ul>
    </ScrollAreaNativeVertical>
  );
}

export { TaskList, type TaskListProps };
