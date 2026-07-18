'use client';

import { useApolloClient } from '@apollo/client/react';
import { PlannerHeader } from '@/app/(private)/planner/_ui/planner-header';
import { invalidateInboxTasks } from '@/entity/planner/inbox';
import { invalidatePlannerInit, usePlannerInit } from '@/entity/planner/init';
import { TaskCreateTrigger } from '@/feature/planner/task-create';

function InboxPageHeader() {
  const { data } = usePlannerInit();
  const client = useApolloClient();

  return (
    <PlannerHeader
      content={
        <TaskCreateTrigger
          disabled={data?.inbox == null}
          groupId={data?.inbox.id}
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
