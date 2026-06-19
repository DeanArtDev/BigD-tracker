'use client';

import { SearchX } from 'lucide-react';
import { memo } from 'react';
import { useGroupListDrawerContext } from '@/entity/planner/groups';
import { TaskList } from '@/entity/planner/tasks';
import { useTaskAssignToGroup } from '@/feature/planner/task-assign-to-group';
import { useTaskDeleteFeature } from '@/feature/planner/task-delete';
import { useTaskUnassignFromGroup } from '@/feature/planner/task-unassign-from-group';
import { EmptyTasksPlaceholder } from './empty-inbox-tasks.placeholder';
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
  const { assignToGroup } = useTaskAssignToGroup();
  const { unassignTaskFromGroup } = useTaskUnassignFromGroup();

  const { openGroupList } = useGroupListDrawerContext();

  const tasks = data.tasks ?? [];
  const count = tasks?.length ?? 0;
  const hasNextPage = data.meta?.hasNextPage ?? false;

  return (
    <TaskList
      tasks={tasks}
      dropdownProps={{
        loading: isTaskDeleteLoading,
        onDelete: async (task) => void deleteTask(task.id),
        onUnassign: async (task) => {
          if (task.groupId != null) {
            await unassignTaskFromGroup({ groupId: task.groupId, taskId: task.id });
          }
        },
        onAssign: (task) => {
          openGroupList({
            selectedGroupIds: data.id != null ? [data.id] : [],
            cb: async (group) => {
              if (task.groupId != group.id) {
                await assignToGroup({ groupId: group.id, taskId: task.id });
              }
            },
          });
        },
      }}
      virtualizerProps={{
        hasNextPage,
        virtualizerOptions: { count },
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
          <EmptyTasksPlaceholder
            title="Ничего не нашлось"
            description="Попробуй изменить запрос или сбросить фильтры."
            icon={<SearchX className="size-7 text-muted-foreground" strokeWidth={2} />}
          />
        ),
      }}
      onRetry={refetch}
    />
  );
});

export { InboxTaskList };
