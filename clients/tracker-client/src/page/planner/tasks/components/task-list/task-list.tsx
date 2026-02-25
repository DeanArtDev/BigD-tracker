import type { TaskEntity } from '@/entity/planner/tasks';
import { TaskActions } from '@/entity/planner/tasks/ui';
import { AppEmptyPlaceholder } from '@/shared/components/app-empty-placeholder';
import { useIsMobile } from '@/shared/ui-kit/helpers';
import { DataLoader } from '@/shared/ui-kit/ui/data-loader';
import { Skeleton } from '@/shared/ui-kit/ui/skeleton';
import { TaskCard } from './task-card';

const TaskCardSkeleton = () => <Skeleton className="h-[50px] w-full rounded-md shadow-md" />;

function LoadingSkeleton() {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col gap-2 px-1">
      {new Array(isMobile ? 12 : 20).fill(0).map((_, index) => (
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
  readonly onFinish?: (task: TaskEntity) => void;
  readonly onDelete?: (task: TaskEntity) => void;
  readonly onRecover?: (task: TaskEntity) => void;
}

function TaskList({
  tasks,
  initialLoading = false,
  loading = false,
  onClick,
  onDelete,
  onFinish,
  onRecover,
}: TaskListProps) {
  return (
    <ul className="flex flex-col gap-1.5 sm:gap-2 justify-center h-full min-h-0 w-full pb-18">
      <DataLoader
        parallelMount
        isLoading={initialLoading}
        loadingElement={<LoadingSkeleton />}
        isEmpty={tasks.length <= 0}
        emptyElement={<AppEmptyPlaceholder message="Дела не найдены." />}
      >
        {tasks.map((task) => {
          return (
            <TaskCard
              key={task.id}
              task={task}
              actionsSlot={
                <TaskActions
                  className="my-auto"
                  taskStatus={task.status}
                  loading={loading}
                  onFinish={() => onFinish?.(task)}
                  onDelete={() => onDelete?.(task)}
                  onRecover={() => onRecover?.(task)}
                />
              }
              onClick={() => onClick(task)}
            />
          );
        })}
      </DataLoader>
    </ul>
  );
}

export { TaskList, type TaskListProps };
