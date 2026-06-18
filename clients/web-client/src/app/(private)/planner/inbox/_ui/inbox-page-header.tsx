'use client';

import { useApolloClient } from '@apollo/client/react';
import { PlannerHeader } from '@/app/(private)/planner/_ui/planner-header';
import { invalidateInboxTasks } from '@/entity/planner/inbox';
import { invalidatePlannerInit, usePlannerInit } from '@/entity/planner/init';
import { TaskCreationDialog } from './task-creation-dialog';

function InboxPageHeader() {
  const { data } = usePlannerInit();
  const client = useApolloClient();

  return (
    <PlannerHeader
      content={
        <TaskCreationDialog
          groupId={data.inbox.id}
          onSuccess={async () => {
            await invalidatePlannerInit(client.cache);
            if (data.inbox.id == null) return;
            await invalidateInboxTasks(client, data.inbox.id);
          }}
        />
      }
    />
  );
}

export { InboxPageHeader };
