'use client';

import { TaskPriorityPicker, TaskStatusSelect } from '@/entity/planner/tasks';
import { TaskListCurrent } from './task-list-current';
import { TasksGroupsSelect } from './tasks-groups-select';
import { TasksRecurrenceSelect } from './tasks-recurrence-select';
import { useGetTasksPerPageCurrent } from '../../_model/use-get-tasks-per-page-current';
import { TasksSearch } from '../tasks-search';
import { TasksSortSelect } from './tasks-sort-select';

function CurrentTasksTabContent() {
  const { selectedPriorities, selectedStatuses, setSearchQuery } = useGetTasksPerPageCurrent();

  return (
    <>
      <div className="flex gap-5 items-center">
        <TasksSearch tab="current" />

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

      <TaskListCurrent />
    </>
  );
}

export { CurrentTasksTabContent };
