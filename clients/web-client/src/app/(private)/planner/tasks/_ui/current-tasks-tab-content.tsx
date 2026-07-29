'use client';

import { GroupId } from '@/entity/planner/groups';
import { TaskList, TaskPriorityPicker, TaskStatusSelect } from '@/entity/planner/tasks';
import { useDebounce } from '@/shared/lib';
import { GetTasksPerPageSortInput, SortDirection, TaskStatus } from '@/shared/transport/graphql';
import { DataLoader } from '@/shared/ui-kit';
import { TasksGroupsSelect } from './tasks-groups-select';
import { TasksRecurrenceSelect } from './tasks-recurrence-select';
import { TasksSearch } from './tasks-search';
import { TasksSortSelect } from './tasks-sort-select';
import { useGetTasksPerPageInfinity } from '../_model/use-get-tasks-per-page-infinity';
import { TasksRecurrence, TasksSort, useTasksUrlQuery } from '../_model/use-tasks-url-query';

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

function CurrentTasksTabContent() {
  const [searchQuery, setSearchQuery] = useTasksUrlQuery();
  const selectedPriorities = searchQuery?.priority ?? [];
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
      700,
    ),
  });

  return (
    <>
      <div className="flex gap-5 items-center">
        <TasksSearch />

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

        <TaskStatusSelect
          values={selectedStatuses}
          onChange={(statuses) => {
            setSearchQuery((previousQuery) => ({
              ...previousQuery,
              status: statuses.length > 0 ? statuses : undefined,
            }));
          }}
        />

        <TasksRecurrenceSelect />

        <TasksGroupsSelect />

        <TasksSortSelect />
      </div>

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
    </>
  );
}

export { CurrentTasksTabContent };
