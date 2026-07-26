'use client';

import { useApolloClient } from '@apollo/client/react';
import { PlannerHeader } from '@/app/(private)/planner/_ui/planner-header';
import { GroupId } from '@/entity/planner/groups';
import { TaskCreateTrigger } from '@/feature/planner/task-create';
import { InboxGroupCacheManager, PlannerInitCacheManager, usePlannerInit } from '@/shared/transport/graphql';

function InboxPageHeader() {
  const { data } = usePlannerInit<GroupId>();
  const inboxId = data?.inbox.id;
  const client = useApolloClient();

  return (
    <PlannerHeader
      content={
        <TaskCreateTrigger
          disabled={data == null}
          groupId={inboxId}
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
