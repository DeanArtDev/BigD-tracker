'use client';

import { useApolloClient } from '@apollo/client/react';
import { TaskCreateTrigger } from '@/feature/planner/task-create';
import { useAppParams } from '@/shared/lib/url';
import { GroupCacheManager, TaskCacheManager } from '@/shared/transport/graphql';
import { PlannerHeader } from '../../_ui/planner-header';
import { groupByIdPageSchema } from '../_lib/constants';

function GroupsPageHeader() {
  const client = useApolloClient();
  const params = useAppParams(groupByIdPageSchema.params);

  return (
    <PlannerHeader
      content={
        <TaskCreateTrigger
          groupId={params?.id}
          onSuccess={async (data) => {
            await TaskCacheManager.refetchTask(client, { taskId: data.id });
            await TaskCacheManager.refetchAssignableTasks(client);
            if (data?.groupId != null) {
              GroupCacheManager.refetchGroup(client, { groupId: data.groupId });
            }
          }}
        />
      }
    />
  );
}

export { GroupsPageHeader };
