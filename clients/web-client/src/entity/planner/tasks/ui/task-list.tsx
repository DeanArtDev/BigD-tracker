import { MaybePromise } from '@/shared/lib';
import {
  DataErrorElement,
  DataLoader,
  DataLoadingElement,
  VirtualizedInfinityScroll,
  VirtualizedInfinityScrollProps,
} from '@/shared/ui-kit';
import { DataLoaderProps } from '@/shared/ui-kit';
import { Task, TaskDomain } from '../model';
import { TaskActionsDropdown } from './task-actions-dropdown';
import { TaskCard } from './task-card';

type TaskListProps = {
  readonly tasks: Task[];
  readonly virtualizerProps: Omit<VirtualizedInfinityScrollProps, 'renderItem'>;
  readonly dataLoaderProps?: DataLoaderProps;

  readonly dropdownProps?: {
    readonly loading?: boolean;
    readonly onDelete?: (task: Task) => MaybePromise<void>;
    readonly onAssign?: (task: Task) => MaybePromise<void>;
    readonly onUnassign?: (task: Task) => MaybePromise<void>;
  };

  readonly onRetry?: () => void;
  readonly onTaskContentClick?: (task: Task) => void;
  readonly onTaskHeaderClick?: (task: Task) => void;
};

function TaskList({
  tasks,
  virtualizerProps,
  dataLoaderProps = {},
  dropdownProps,

  onRetry,
  onTaskHeaderClick,
  onTaskContentClick,
}: TaskListProps) {
  return (
    <DataLoader
      loadingElement={<DataLoadingElement />}
      errorElement={<DataErrorElement className="grow" onRetry={onRetry} />}
      {...dataLoaderProps}
    >
      <VirtualizedInfinityScroll
        infinityScrollOptions={{ bottomGap: 400 }}
        {...virtualizerProps}
        virtualizerOptions={{ gap: 10, overscan: 5, ...virtualizerProps.virtualizerOptions }}
        renderItem={(virtualItem) => {
          const task = tasks[virtualItem.index];
          if (task == null) return null;

          return (
            <TaskCard
              id={task.id}
              name={task.name}
              priority={task.priority}
              status={task.status}
              deadline={task.deadline ?? undefined}
              afterHeaderSlot={
                <TaskActionsDropdown
                  taskStatus={task.status}
                  hasGroup={task.groupId != null}
                  loading={dropdownProps?.loading ?? false}
                  taskType={TaskDomain.parseId(task.id).type}
                  onDelete={() => void dropdownProps?.onDelete?.(task)}
                  onAssign={() => void dropdownProps?.onAssign?.(task)}
                  onUnassign={() => void dropdownProps?.onUnassign?.(task)}
                />
              }
              onContentClick={() => void onTaskContentClick?.(task)}
              onHeaderClick={() => void onTaskHeaderClick?.(task)}
            />
          );
        }}
      />
    </DataLoader>
  );
}

export { TaskList, type TaskListProps };
