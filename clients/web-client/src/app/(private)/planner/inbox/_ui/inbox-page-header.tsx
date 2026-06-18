'use client';

import { useApolloClient } from '@apollo/client/react';
import { PlannerHeader } from '@/app/(private)/planner/_ui/planner-header';
import { invalidateInboxTasks, useInboxQuery } from '@/entity/planner/inbox';
import { invalidatePlannerInit } from '@/entity/planner/init';
import { TaskCreationDialog } from './task-creation-dialog';

function InboxPageHeader() {
  const { data } = useInboxQuery();
  const client = useApolloClient();

  return (
    <PlannerHeader
      content={
        <TaskCreationDialog
          groupId={data.id}
          onSuccess={async () => {
            await invalidatePlannerInit(client.cache);
            if (data.id == null) return;
            await invalidateInboxTasks(client, data.id);
          }}
        />
      }
    />
  );
}

export { InboxPageHeader };
