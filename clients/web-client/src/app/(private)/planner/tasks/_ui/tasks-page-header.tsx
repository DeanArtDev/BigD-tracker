'use client';

import { useApolloClient } from '@apollo/client/react';
import { TaskCreateTrigger } from '@/feature/planner/task-create';
import { TaskCacheManager } from '@/shared/transport/graphql';
import { PlannerHeader } from '../../_ui/planner-header';

function TasksPageHeader() {
  const client = useApolloClient();

  return (
    <PlannerHeader
      content={
        <TaskCreateTrigger
          onSuccess={async () => {
            await TaskCacheManager.refetchGetTasksPerPage(client);
            await TaskCacheManager.refetchAssignableTasks(client);
          }}
        />
      }
    />
  );
}

export { TasksPageHeader };
