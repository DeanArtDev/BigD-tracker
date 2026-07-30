import { useGroupListDrawerContext } from '@/entity/planner/groups';
import { TaskList } from '@/entity/planner/tasks';
import { useTaskUpdateContext } from '@/feature/planner/task-update';
import { DataLoader } from '@/shared/ui-kit';
import { useTaskActionsFeature } from '@/widget/planner/task-actions';
import { useGetTasksPerPageCurrent } from '../../_model/use-get-tasks-per-page-current';

function TaskListCurrent() {
  const { tasks, refetch, meta, isError, initialLoading, isEmpty, loading, fetchMore } = useGetTasksPerPageCurrent();
  const { openGroupList } = useGroupListDrawerContext();
  const {
    isActionLoading,
    taskFinishDialogHolder,
    taskAssignHandler,
    taskDeleteHandler,
    taskUnassignHandler,
    taskCloneHandler,
    taskFinishHandler,
  } = useTaskActionsFeature();

  const { openTaskUpdate } = useTaskUpdateContext();

  return (
    <>
      <TaskList
        tasks={tasks}
        onRetry={refetch}
        virtualizerProps={{
          className: 'h-full',
          isError,
          hasNextPage: meta?.nextPage ?? false,
          isLoadingNextPage: loading,
          onNextPageLoad: fetchMore,
          virtualizerOptions: {
            count: tasks.length,
            estimateSize: () => 84,
            gap: 10,
          },
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
              selectedGroupIds: task.groupId != null ? [task.groupId] : [],
              cb: async (group) => {
                if (task.groupId != group.id) {
                  taskAssignHandler({ groupId: group.id, task });
                }
              },
            });
          },
        }}
        dataLoaderProps={{
          isLoading: initialLoading,
          isEmpty,
          emptyElement: <DataLoader.Empty title="Дел пока нет" />,
        }}
        dropdownProps={{
          onAssign: (task, { id }) => void taskAssignHandler({ groupId: id, task }),
        }}
        onTaskContentClick={openTaskUpdate}
      />

      {taskFinishDialogHolder}
    </>
  );
}

export { TaskListCurrent };
