import { useState } from 'react';
import { useDebounce } from 'react-use';
import { TaskStatus } from '@/shared/transport/graphql';
import { useGetTasksPerPageInfinity } from './use-get-tasks-per-page-infinity';
import { useTasksTabUrlQuery } from './use-tasks-url-query';

const deletedTaskStatuses: TaskStatus[] = [TaskStatus.Deleted];

function useGetTasksPerPageDeleted() {
  const [searchQuery, setSearchQuery] = useTasksTabUrlQuery('deleted');
  const selectedPriorities = searchQuery?.priority ?? [];

  const requestParams = {
    status: deletedTaskStatuses,
    priority: selectedPriorities,
  };
  const requestParamsKey = JSON.stringify(requestParams);
  const [debouncedRequestParams, setDebouncedRequestParams] = useState(requestParams);

  useDebounce(() => void setDebouncedRequestParams(requestParams), 500, [requestParamsKey]);

  const { tasks, meta, loading, initialLoading, isEmpty, isError, fetchMore, refetch } = useGetTasksPerPageInfinity({
    search: searchQuery?.search,
    ...debouncedRequestParams,
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
