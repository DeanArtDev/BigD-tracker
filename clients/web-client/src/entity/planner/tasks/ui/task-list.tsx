import { ReactNode } from 'react';
import { Brand, MaybePromise } from '@/shared/lib';
import {
  DataLoader,
  DataLoaderProps,
  VirtualizedInfinityScroll,
  VirtualizedInfinityScrollProps,
} from '@/shared/ui-kit';
import { Task, TaskDomain } from '../model';
import { TaskActionsDropdown } from './task-actions-dropdown';
import { TaskCard } from './task-card';

type TaskListProps<BrandGroup extends Brand<number, string>> = {
  readonly tasks: Task<BrandGroup>[];
  readonly virtualizerProps: Omit<VirtualizedInfinityScrollProps, 'renderItem'>;
  readonly dataLoaderProps?: DataLoaderProps;

  readonly menuProps?: {
    readonly loading?: boolean;
    readonly onDelete?: (task: Task<BrandGroup>) => MaybePromise<void>;
    readonly onClone?: (task: Task<BrandGroup>) => MaybePromise<void>;
    readonly onAssign?: (task: Task<BrandGroup>) => MaybePromise<void>;
    readonly onUnassign?: (task: Task<BrandGroup>) => MaybePromise<void>;
    readonly onFinish?: (task: Task<BrandGroup>) => MaybePromise<void>;
    readonly onRecover?: (task: Task<BrandGroup>) => MaybePromise<void>;
    readonly onDeleteComplete?: (task: Task<BrandGroup>) => MaybePromise<void>;
  };

  readonly slots?: {
    readonly beforeCardBottomRowSlot?: (task: Task<BrandGroup>) => ReactNode;
    readonly beforeCardMenuSlot?: (task: Task<BrandGroup>) => ReactNode;
  };

  readonly onRetry?: () => void;
  readonly onTaskContentClick?: (task: Task<BrandGroup>) => void;
  readonly onTaskHeaderClick?: (task: Task<BrandGroup>) => void;
};

function TaskList<BrandGroup extends Brand<number, string>>({
  tasks,
  virtualizerProps,
  dataLoaderProps = {},
  menuProps,

  slots,

  onRetry,
  onTaskHeaderClick,
  onTaskContentClick,
}: TaskListProps<BrandGroup>) {
  const handlerOrEmpty = (task: Task<BrandGroup>, handler?: (task: Task<BrandGroup>) => MaybePromise<void>) =>
    handler != null ? () => handler(task) : undefined;

  return (
    <DataLoader
      loadingElement={<DataLoader.Loading />}
      errorElement={<DataLoader.Error className="grow" onRetry={onRetry} />}
      {...dataLoaderProps}
    >
      <VirtualizedInfinityScroll
        infinityScrollOptions={{ bottomGap: 400 }}
        {...virtualizerProps}
        virtualizerOptions={{ gap: 0, overscan: 7, ...virtualizerProps.virtualizerOptions }}
        renderItem={(virtualItem) => {
          const task = tasks[virtualItem.index];
          if (task == null) return null;

          const repeatable = task?.recurrence != null;

          return (
            <TaskCard
              id={task.id}
              name={task.name}
              repeatable={repeatable}
              priority={task.priority}
              status={task.status}
              deadline={task.deadline ?? undefined}
              beforeBottomRowSlot={() => slots?.beforeCardBottomRowSlot?.(task)}
              afterHeaderSlot={() => (
                <div className="flex gap-1">
                  {slots?.beforeCardMenuSlot?.(task)}

                  <TaskActionsDropdown
                    taskStatus={task.status}
                    hasGroup={task.groupId != null}
                    loading={menuProps?.loading ?? false}
                    taskType={TaskDomain.parseId(task.id, repeatable).type}
                    onDelete={handlerOrEmpty(task, menuProps?.onDelete)}
                    onDeleteComplete={handlerOrEmpty(task, menuProps?.onDeleteComplete)}
                    onFinish={handlerOrEmpty(task, menuProps?.onFinish)}
                    onAssign={handlerOrEmpty(task, menuProps?.onAssign)}
                    onClone={handlerOrEmpty(task, menuProps?.onClone)}
                    onUnassign={handlerOrEmpty(task, menuProps?.onUnassign)}
                    onRecover={handlerOrEmpty(task, menuProps?.onRecover)}
                  />
                </div>
              )}
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
