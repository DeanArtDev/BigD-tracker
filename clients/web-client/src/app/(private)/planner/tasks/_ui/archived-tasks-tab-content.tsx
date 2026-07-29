'use client';

import { TaskList, TaskPriorityPicker } from '@/entity/planner/tasks';
import { useDebounce } from '@/shared/lib';
import { TaskStatus } from '@/shared/transport/graphql';
import { DataLoader } from '@/shared/ui-kit';
import { TasksSearch } from './tasks-search';
import { useGetTasksPerPageInfinity } from '../_model/use-get-tasks-per-page-infinity';
import { useTasksTabUrlQuery } from '../_model/use-tasks-url-query';

const archivedTaskStatuses: TaskStatus[] = [TaskStatus.Archived];

function ArchivedTasksTabContent() {
  const [searchQuery, setSearchQuery] = useTasksTabUrlQuery('archived');
  const selectedPriorities = searchQuery?.priority ?? [];

  const { tasks, meta, loading, initialLoading, isEmpty, isError, fetchMore, refetch } = useGetTasksPerPageInfinity({
    search: searchQuery?.search,
    ...useDebounce(
      {
        status: archivedTaskStatuses,
        priority: selectedPriorities,
      },
      700,
    ),
  });

  return (
    <>
      <div className="flex items-center gap-5">
        <TasksSearch tab="archived" />

        <TaskPriorityPicker
          className="ml-auto"
          value={selectedPriorities}
          onChange={(priorities) => {
            setSearchQuery((previousQuery) => ({
              ...previousQuery,
              priority: priorities.length > 0 ? priorities : undefined,
            }));
          }}
        />
      </div>

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
          isError,
          isLoading: initialLoading,
          isEmpty,
          emptyElement: <DataLoader.Empty title="Дел в архиве пока нет" />,
        }}
      />
    </>
  );
}

export { ArchivedTasksTabContent };
