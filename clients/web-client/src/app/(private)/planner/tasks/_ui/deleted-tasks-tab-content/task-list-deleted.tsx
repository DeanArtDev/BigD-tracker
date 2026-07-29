import { TaskList } from '@/entity/planner/tasks';
import { useTaskUpdateContext } from '@/feature/planner/task-update';
import { DataLoader } from '@/shared/ui-kit';
import { useGetTasksPerPageDeleted } from '../../_model/use-get-tasks-per-page-deleted';

function TaskListDeleted() {
  const { tasks, refetch, meta, isError, initialLoading, isEmpty, loading, fetchMore } = useGetTasksPerPageDeleted();
  const { openTaskUpdate } = useTaskUpdateContext();

  return (
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
      dataLoaderProps={{
        isLoading: initialLoading,
        isEmpty,
        emptyElement: <DataLoader.Empty title="Дел пока нет" />,
      }}
      onTaskContentClick={openTaskUpdate}
    />
  );
}

export { TaskListDeleted };
