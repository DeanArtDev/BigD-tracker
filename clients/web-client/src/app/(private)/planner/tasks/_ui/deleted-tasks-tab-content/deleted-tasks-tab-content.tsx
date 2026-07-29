'use client';

import { TaskPriorityPicker } from '@/entity/planner/tasks';
import { useGetTasksPerPageDeleted } from '../../_model/use-get-tasks-per-page-deleted';
import { TasksSearch } from '../tasks-search';
import { TaskListDeleted } from './task-list-deleted';

function DeletedTasksTabContent() {
  const { selectedPriorities, setSearchQuery } = useGetTasksPerPageDeleted();

  return (
    <>
      <div className="flex items-center gap-5">
        <TasksSearch tab="deleted" />

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

      <TaskListDeleted />
    </>
  );
}

export { DeletedTasksTabContent };
