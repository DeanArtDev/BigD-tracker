import { GroupId } from '@/entity/planner/groups';
import { useDebounce } from '@/shared/lib';
import { GetTasksPerPageSortInput, SortDirection, TaskStatus } from '@/shared/transport/graphql';
import { useGetTasksPerPageInfinity } from './use-get-tasks-per-page-infinity';
import { TasksRecurrence, TasksSort, useTasksTabUrlQuery } from './use-tasks-url-query';

const currentTaskStatuses: TaskStatus[] = [
  TaskStatus.NotStarted,
  TaskStatus.InProgress,
  TaskStatus.Completed,
  TaskStatus.Overdue,
  TaskStatus.Canceled,
];

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
  const selectedStatuses = (searchQuery?.status ?? []).filter((status) => currentTaskStatuses.includes(status));
  const selectedGroupIds = (searchQuery?.groupIds ?? []) as GroupId[];

  const { tasks, meta, loading, initialLoading, isEmpty, isError, fetchMore, refetch } = useGetTasksPerPageInfinity({
    search: searchQuery?.search,
    ...useDebounce(
      {
        status: selectedStatuses.length > 0 ? selectedStatuses : currentTaskStatuses,
        priority: selectedPriorities,
        sort: searchQuery?.sort == null ? undefined : tasksSortMap[searchQuery.sort],
        recurring: searchQuery?.recurring == null ? undefined : tasksRecurrenceMap[searchQuery.recurring],
        groupIds: selectedGroupIds,
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

    sort,
    recurring,
    selectedPriorities,
    selectedStatuses,
    selectedGroupIds,

    setSearchQuery,
  };
}

export { useGetTasksPerPageCurrent };
