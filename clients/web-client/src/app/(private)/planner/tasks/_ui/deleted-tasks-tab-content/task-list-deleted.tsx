import { useState } from 'react';
import { useGroupListDrawerContext } from '@/entity/planner/groups';
import { TaskId, TaskList } from '@/entity/planner/tasks';
import { TaskRecoveryDialog } from '@/feature/planner/task-recovery';
import { useTaskUpdateContext } from '@/feature/planner/task-update';
import { DataLoader } from '@/shared/ui-kit';
import { useTaskActionsFeature } from '@/widget/planner/task-actions';
import { useGetTasksPerPageDeleted } from '../../_model/use-get-tasks-per-page-deleted';

function TaskListDeleted() {
  const {
    tasks,
    refetch,
    meta,
    isError,
    initialLoading,
    isEmpty,
    loading: isTasksPerPageLoading,
    fetchMore,
  } = useGetTasksPerPageDeleted();
  const { openTaskUpdate } = useTaskUpdateContext();
  const { openGroupList } = useGroupListDrawerContext();

  const [open, setOpen] = useState(false);
  const [recoveryTaskData, setRecoveryTaskData] = useState<{ taskId: TaskId }>();

  const { taskRecoveryHandler, taskCopyHandler, taskAssignHandler, taskFinishDialogHolder, isActionLoading } =
    useTaskActionsFeature();

  return (
    <>
      <TaskList
        tasks={tasks}
        onRetry={refetch}
        virtualizerProps={{
          className: 'h-full',
          isError,
          hasNextPage: meta?.nextPage ?? false,
          isLoadingNextPage: isTasksPerPageLoading,
          onNextPageLoad: fetchMore,
          virtualizerOptions: {
            count: tasks.length,
            estimateSize: () => 84,
            gap: 10,
          },
        }}
        dataLoaderProps={{
          isLoading: initialLoading,
          isEmpty,
          emptyElement: <DataLoader.Empty title="Дел пока нет" />,
        }}
        dropdownProps={{ onAssign: (task, { id }) => void taskAssignHandler({ task, groupId: id }) }}
        menuProps={{
          loading: isActionLoading,
          onCopy: (task) => void taskCopyHandler(task.id),
          onRecover: (task) => {
            setOpen(true);
            setRecoveryTaskData({ taskId: task.id });
          },

          onAssign: (task) => {
            openGroupList({
              selectedGroupIds: task.groupId != null ? [task.groupId] : [],
              cb: async (group) => {
                if (task.groupId != group.id) {
                  taskAssignHandler({ groupId: group.id, task });
                }
              },
            });
          },
        }}
        onTaskContentClick={openTaskUpdate}
      />

      {taskFinishDialogHolder}

      <TaskRecoveryDialog
        open={open}
        onOpenChange={setOpen}
        loading={isActionLoading}
        onRecover={async (groupId) => {
          if (recoveryTaskData == null) return;
          await taskRecoveryHandler({ taskId: recoveryTaskData?.taskId, groupId });
          setOpen(false);
        }}
      />
    </>
  );
}

export { TaskListDeleted };
