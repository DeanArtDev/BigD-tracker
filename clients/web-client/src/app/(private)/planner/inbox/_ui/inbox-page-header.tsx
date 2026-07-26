'use client';

import { useApolloClient } from '@apollo/client/react';
import { PlannerHeader } from '@/app/(private)/planner/_ui/planner-header';
import { usePlannerInit } from '@/entity/planner/init';
import { TaskCreateTrigger } from '@/feature/planner/task-create';
import { InboxGroupCacheManager, PlannerInitCacheManager } from '@/shared/transport/graphql';

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
            PlannerInitCacheManager.refetch(client);
            InboxGroupCacheManager.refetch(client);
          }}
        />
      }
    />
  );
}

export { InboxPageHeader };
