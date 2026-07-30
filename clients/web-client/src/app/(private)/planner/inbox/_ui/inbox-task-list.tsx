'use client';

import { FolderOutput, SearchX } from 'lucide-react';
import { memo } from 'react';
import { GroupListDropdown, GroupTaskIndication, useGroupListDrawerContext } from '@/entity/planner/groups';
import { TaskActionType, TaskDomain, TaskList } from '@/entity/planner/tasks';
import { useTaskUpdateContext } from '@/feature/planner/task-update';
import { AppTooltip } from '@/shared/project-ui';
import { Button, DataLoader } from '@/shared/ui-kit';
import { useTaskActionsFeature } from '@/widget/planner/task-actions';
import { useInboxQueryByUrlQuery } from '../_model/use-inbox-query-by-url-query';

const InboxTaskList = memo(function InboxTaskListMemo() {
  const {
    data,
    isError,
    isEmpty,
    refetch,
    loading: isInboxLoading,
    initialLoading,
    fetchMore,
  } = useInboxQueryByUrlQuery();

  const {
    taskFinishDialogHolder,
    isActionLoading,
    taskFinishHandler,
    taskAssignHandler,
    taskDeleteHandler,
    taskUnassignHandler,
    taskCloneHandler,
  } = useTaskActionsFeature();

  const { openGroupList } = useGroupListDrawerContext();

  const { openTaskUpdate } = useTaskUpdateContext();

  const tasks = data.tasks ?? [];
  const count = tasks?.length ?? 0;
  const hasNextPage = data.meta?.hasNextPage ?? false;

  return (
    <>
      <TaskList
        tasks={tasks}
        onTaskContentClick={(task) => {
          if (isActionLoading) return;
          openTaskUpdate(task);
        }}
        menuProps={{
          loading: isActionLoading,
          onDelete: async (task) => void taskDeleteHandler({ groupId: task?.groupId, taskId: task.id }),
          onClone: async (task) => void taskCloneHandler(task.id),
          onFinish: (task) => void taskFinishHandler(task.id),
          onUnassign: async (task) => {
            if (task.groupId != null) {
              taskUnassignHandler({ groupId: task.groupId, taskId: task.id });
            }
          },
          onAssign: (task) => {
            openGroupList({
              selectedGroupIds: data.id != null ? [data.id] : [],
              cb: async (group) => {
                if (task.groupId != group.id) {
                  taskAssignHandler({ groupId: group.id, task });
                }
              },
            });
          },
        }}
        virtualizerProps={{
          hasNextPage,
          isError,
          virtualizerOptions: { count, estimateSize: () => 84, gap: 10 },
          isLoadingNextPage: isInboxLoading,
          infinityScrollOptions: {
            bottomGap: 400,
          },
          onNextPageLoad: fetchMore,
        }}
        dataLoaderProps={{
          isLoading: initialLoading,
          isEmpty,
          emptyElement: (
            <DataLoader.Empty
              title="Ничего не нашлось"
              description="Попробуй изменить запрос или сбросить фильтры."
              icon={<SearchX className="size-7 text-muted-foreground" strokeWidth={2} />}
            />
          ),
        }}
        slots={{
          beforeCardBottomRowSlot: (task) => <GroupTaskIndication className="ml-2" groupId={task.groupId} />,
          beforeCardMenuSlot: (task) => {
            const isAllowAssign = TaskDomain.isAllowTaskAction(
              TaskActionType.Assign,
              task.status,
              TaskDomain.parseId(task.id).type,
            );

            if (!isAllowAssign) return null;
            return (
              <GroupListDropdown
                selectedGroupId={task.groupId}
                trigger={
                  <Button size="icon-sm" variant="ghost" disabled={isActionLoading}>
                    <AppTooltip content="Переместить в группу" delayDuration={2000} asChild>
                      <FolderOutput />
                    </AppTooltip>
                  </Button>
                }
                onSelect={(groupInfo) => void taskAssignHandler({ groupId: groupInfo.id, task })}
              />
            );
          },
        }}
        onRetry={refetch}
      />

      {taskFinishDialogHolder}
    </>
  );
});

export { InboxTaskList };
