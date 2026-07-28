'use client';

import { TaskList } from '@/entity/planner/tasks';
import { TaskStatus } from '@/shared/transport/graphql';
import { DataLoader } from '@/shared/ui-kit';
import { useGetTasksPerPageInfinity } from '../_model/use-get-tasks-per-page-infinity';

const archivedTaskStatuses: TaskStatus[] = [TaskStatus.Archived];

function ArchivedTasksTabContent() {
  const { tasks, meta, loading, initialLoading, isEmpty, isError, fetchMore, refetch } = useGetTasksPerPageInfinity({
    status: archivedTaskStatuses,
  });

  return (
    <TaskList
      tasks={tasks}
      onRetry={refetch}
      virtualizerProps={{
        className: 'h-full',
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
        isError,
        isLoading: initialLoading,
        isEmpty,
        emptyElement: <DataLoader.Empty title="Дел пока нет" />,
      }}
    />
  );
}

export { ArchivedTasksTabContent };
