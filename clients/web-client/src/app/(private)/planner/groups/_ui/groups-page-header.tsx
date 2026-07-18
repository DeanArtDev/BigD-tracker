'use client';

import { useApolloClient } from '@apollo/client/react';
import { invalidateGroup } from '@/entity/planner/groups';
import { TaskCreateTrigger } from '@/feature/planner/task-create';
import { useAppParams } from '@/shared/lib/url';
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
          onSuccess={async () => {
            if (params?.id != null) {
              await invalidateGroup(client.cache, params.id);
            }
          }}
        />
      }
    />
  );
}

export { GroupsPageHeader };
