'use client';

import { SearchX } from 'lucide-react';
import { memo } from 'react';
import { useGroupListDrawerContext } from '@/entity/planner/groups';
import { TaskList } from '@/entity/planner/tasks';
import { useTaskAssignToGroupFeature } from '@/feature/planner/task-assign-to-group';
import { useTaskCopyFeature } from '@/feature/planner/task-copy';
import { useTaskDeleteFeature } from '@/feature/planner/task-delete';
import { useTaskFinishFeature } from '@/feature/planner/task-finish';
import { useTaskUnassignFromGroup } from '@/feature/planner/task-unassign-from-group';
import { useTaskUpdateContext } from '@/feature/planner/task-update';
import { useNotify } from '@/shared/lib';
import { DataLoader } from '@/shared/ui-kit';
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

  const { deleteTask, loading: isTaskDeleteLoading } = useTaskDeleteFeature();
  const { assignToGroup, loading: isTaskAssignLoading } = useTaskAssignToGroupFeature();
  const { unassignTaskFromGroup, loading: isTaskUnassignLoading } = useTaskUnassignFromGroup();
  const { copyTask, loading: isTaskCopyLoading } = useTaskCopyFeature();
  const { finishTask, loading: isTaskFinishLoading, taskFinishDialogHolder } = useTaskFinishFeature();

  const { promise } = useNotify();
  const { openGroupList } = useGroupListDrawerContext();

  const { openTaskUpdate } = useTaskUpdateContext();

  const tasks = data.tasks ?? [];
  const count = tasks?.length ?? 0;
  const hasNextPage = data.meta?.hasNextPage ?? false;
  const isActionLoading =
    isTaskFinishLoading || isTaskDeleteLoading || isTaskUnassignLoading || isTaskAssignLoading || isTaskCopyLoading;

  return (
    <>
      <TaskList
        tasks={tasks}
        onTaskContentClick={openTaskUpdate}
        dropdownProps={{
          onAssign: (task, groupInfo) => {
            promise(assignToGroup({ groupId: groupInfo.id, taskId: task.id }));
          },
        }}
        menuProps={{
          loading: isActionLoading,
          onDelete: async (task) => void deleteTask(task.id),
          onCopy: async (task) => void copyTask(task.id),
          onFinish: (task) => void finishTask(task.id),
          onUnassign: async (task) => {
            if (task.groupId != null) {
              promise(unassignTaskFromGroup({ groupId: task.groupId, taskId: task.id }));
            }
          },
          onAssign: (task) => {
            openGroupList({
              selectedGroupIds: data.id != null ? [data.id] : [],
              cb: async (group) => {
                if (task.groupId != group.id) {
                  promise(assignToGroup({ groupId: group.id, taskId: task.id }));
                }
              },
            });
          },
        }}
        virtualizerProps={{
          hasNextPage,
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
