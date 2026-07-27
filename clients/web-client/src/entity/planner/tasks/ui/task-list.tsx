import { FolderOutput } from 'lucide-react';
import { GroupInfo, GroupListDropdown } from '@/entity/planner/groups';
import { MaybePromise } from '@/shared/lib';
import { AppTooltip } from '@/shared/project-ui';
import { Button, DataLoader, VirtualizedInfinityScroll, VirtualizedInfinityScrollProps } from '@/shared/ui-kit';
import { DataLoaderProps } from '@/shared/ui-kit';
import { Task, TaskActionType, TaskDomain } from '../model';
import { TaskActionsDropdown } from './task-actions-dropdown';
import { TaskCard } from './task-card';

type TaskListProps = {
  readonly tasks: Task[];
  readonly virtualizerProps: Omit<VirtualizedInfinityScrollProps, 'renderItem'>;
  readonly dataLoaderProps?: DataLoaderProps;

  readonly menuProps?: {
    readonly loading?: boolean;
    readonly onDelete?: (task: Task) => MaybePromise<void>;
    readonly onCopy?: (task: Task) => MaybePromise<void>;
    readonly onAssign?: (task: Task) => MaybePromise<void>;
    readonly onUnassign?: (task: Task) => MaybePromise<void>;
    readonly onFinish?: (task: Task) => MaybePromise<void>;
  };

  readonly dropdownProps?: {
    readonly onAssign?: (task: Task, groupInfo: GroupInfo) => MaybePromise<void>;
  };

  readonly onRetry?: () => void;
  readonly onTaskContentClick?: (task: Task) => void;
  readonly onTaskHeaderClick?: (task: Task) => void;
};

function TaskList({
  tasks,
  virtualizerProps,
  dataLoaderProps = {},
  menuProps,
  dropdownProps,

  onRetry,
  onTaskHeaderClick,
  onTaskContentClick,
}: TaskListProps) {
  return (
    <DataLoader
      loadingElement={<DataLoader.Loading />}
      errorElement={<DataLoader.Error className="grow" onRetry={onRetry} />}
      {...dataLoaderProps}
    >
      <VirtualizedInfinityScroll
        infinityScrollOptions={{ bottomGap: 400 }}
        {...virtualizerProps}
        virtualizerOptions={{ gap: 0, overscan: 5, ...virtualizerProps.virtualizerOptions }}
        renderItem={(virtualItem) => {
          const task = tasks[virtualItem.index];
          if (task == null) return null;
          const isAllowAssign = TaskDomain.isAllowTaskAction(
            TaskActionType.Assign,
            task.status,
            TaskDomain.parseId(task.id).type,
          );

          return (
            <TaskCard
              id={task.id}
              name={task.name}
              priority={task.priority}
              status={task.status}
              deadline={task.deadline ?? undefined}
              afterHeaderSlot={() => (
                <div className="flex gap-1">
                  {isAllowAssign && (
                    <GroupListDropdown
                      selectedGroupId={task.groupId}
                      trigger={
                        <Button size="icon-sm" variant="ghost" disabled={menuProps?.loading}>
                          <AppTooltip content="Переместить в группу" delayDuration={2000} asChild>
                            <FolderOutput />
                          </AppTooltip>
                        </Button>
                      }
                      onSelect={(groupInfo) => void dropdownProps?.onAssign?.(task, groupInfo)}
                    />
                  )}

                  <TaskActionsDropdown
                    taskStatus={task.status}
                    hasGroup={task.groupId != null}
                    loading={menuProps?.loading ?? false}
                    taskType={TaskDomain.parseId(task.id).type}
                    onDelete={() => void menuProps?.onDelete?.(task)}
                    onFinish={() => void menuProps?.onFinish?.(task)}
                    onAssign={() => void menuProps?.onAssign?.(task)}
                    onCopy={() => void menuProps?.onCopy?.(task)}
                    onUnassign={() => void menuProps?.onUnassign?.(task)}
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
