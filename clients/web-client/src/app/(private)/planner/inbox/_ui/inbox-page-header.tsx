'use client';

import { useApolloClient } from '@apollo/client/react';
import { PlannerHeader } from '@/app/(private)/planner/_ui/planner-header';
import { invalidateInboxTasks } from '@/entity/planner/inbox';
import { useSidebarInfoQuerySuspense } from '@/widget/planner/planner-sidebar';
import { TaskCreationDialog } from './task-creation-dialog';

function InboxPageHeader() {
  const { data } = useSidebarInfoQuerySuspense();
  const client = useApolloClient();

  return (
    <PlannerHeader
      content={
        <TaskCreationDialog
          groupId={data.id}
          onSuccess={async () => {
            await invalidateInboxTasks(client, data.id);
          }}
        />
      }
    />
  );
}

export { InboxPageHeader };
