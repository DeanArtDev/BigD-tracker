'use client';

import { SearchX } from 'lucide-react';
import { memo } from 'react';
import { useGroupListDrawerContext } from '@/entity/planner/groups';
import { TaskList } from '@/entity/planner/tasks';
import { useTaskUpdateContext } from '@/feature/planner/task-update';
import { DataLoader } from '@/shared/ui-kit';
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
    taskCopyHandler,
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
        dropdownProps={{
          onAssign: (task, groupInfo) => {
            taskAssignHandler({ groupId: groupInfo.id, task });
          },
        }}
        menuProps={{
          loading: isActionLoading,
          onDelete: async (task) => void taskDeleteHandler({ groupId: task?.groupId, taskId: task.id }),
          onCopy: async (task) => void taskCopyHandler(task.id),
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
          isError,
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
        onRetry={refetch}
      />

      {taskFinishDialogHolder}
    </>
  );
});

export { InboxTaskList };
