import { useState } from 'react';
import { useDebounce } from 'react-use';
import { GroupId } from '@/entity/planner/groups';
import { currentTasksStatuses } from '@/entity/planner/tasks';
import { GetTasksPerPageSortInput, SortDirection } from '@/shared/transport/graphql';
import { useGetTasksPerPageInfinity } from './use-get-tasks-per-page-infinity';
import { TasksRecurrence, TasksSort, useTasksTabUrlQuery } from './use-tasks-url-query';

const tasksSortMap: Record<TasksSort, GetTasksPerPageSortInput> = {
  startDateAsc: { startDate: SortDirection.Asc },
  startDateDesc: { startDate: SortDirection.Desc },
  deadlineAsc: { deadline: SortDirection.Asc },
  deadlineDesc: { deadline: SortDirection.Desc },
};

const tasksRecurrenceMap: Record<TasksRecurrence, boolean> = {
  onlyRecurring: true,
  onlyNonRecurring: false,
};

function useGetTasksPerPageCurrent() {
  const [searchQuery, setSearchQuery] = useTasksTabUrlQuery('current');

  const selectedPriorities = searchQuery?.priority ?? [];
  const sort = searchQuery?.sort;
  const recurring = searchQuery?.recurring;
  const selectedStatuses = (searchQuery?.status ?? []).filter((status) => currentTasksStatuses.includes(status));
  const selectedGroupIds = (searchQuery?.groupIds ?? []) as GroupId[];

  const requestParams = {
    status: selectedStatuses.length > 0 ? selectedStatuses : currentTasksStatuses,
    priority: selectedPriorities,
    sort: searchQuery?.sort == null ? undefined : tasksSortMap[searchQuery.sort],
    recurring: searchQuery?.recurring == null ? undefined : tasksRecurrenceMap[searchQuery.recurring],
    groupIds: selectedGroupIds,
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

    sort,
    recurring,
    selectedPriorities,
    selectedStatuses,
    selectedGroupIds,

    setSearchQuery,
  };
}

export { useGetTasksPerPageCurrent };
