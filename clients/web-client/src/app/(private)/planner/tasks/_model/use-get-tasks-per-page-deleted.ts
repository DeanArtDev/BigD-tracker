import { useDebounce } from '@/shared/lib';
import { TaskStatus } from '@/shared/transport/graphql';
import { useGetTasksPerPageInfinity } from './use-get-tasks-per-page-infinity';
import { useTasksTabUrlQuery } from './use-tasks-url-query';

const deletedTaskStatuses: TaskStatus[] = [TaskStatus.Deleted];

function useGetTasksPerPageDeleted() {
  const [searchQuery, setSearchQuery] = useTasksTabUrlQuery('deleted');
  const selectedPriorities = searchQuery?.priority ?? [];

  const { tasks, meta, loading, initialLoading, isEmpty, isError, fetchMore, refetch } = useGetTasksPerPageInfinity({
    search: searchQuery?.search,
    ...useDebounce(
      {
        status: deletedTaskStatuses,
        priority: selectedPriorities,
      },
      500,
    ),
  });

  return {
    tasks,
    meta,
    loading,
    initialLoading,
    isEmpty,
    isError,
    fetchMore,
    refetch,

    selectedPriorities,

    setSearchQuery,
  };
}

export { useGetTasksPerPageDeleted };
