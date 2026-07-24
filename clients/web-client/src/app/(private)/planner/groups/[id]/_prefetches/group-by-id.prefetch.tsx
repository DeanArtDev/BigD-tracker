import { ReactNode } from 'react';
import { GroupId } from '@/entity/planner/groups';
import { getClient } from '@/shared/transport/graphql/server';
import { shapeGetDetailedGroupOptions } from '../_api';
import { GroupByIdHydrator } from './group-by-id.hydrate';

async function GroupByIdPrefetch({ groupId, children }: { groupId: GroupId; children: ReactNode }) {
  const client = await getClient();
  const { data } = await client.query({
    ...shapeGetDetailedGroupOptions({ groupId }),
    errorPolicy: 'ignore',
  });

  return <GroupByIdHydrator data={data}>{children}</GroupByIdHydrator>;
}

export { GroupByIdPrefetch };
