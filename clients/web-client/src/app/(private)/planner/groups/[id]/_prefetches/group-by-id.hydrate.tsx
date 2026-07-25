'use client';

import { ApolloClient } from '@apollo/client';
import { useApolloClient } from '@apollo/client/react';
import { ReactNode } from 'react';
import { GroupId } from '@/entity/planner/groups';
import { GetDetailedGroupByIdQuery, shapeGetDetailedGroupOptions } from '../_api';

const hydratedGroups = new WeakMap<ApolloClient, Set<GroupId>>();

function getHydratedGroups(client: ApolloClient): Set<GroupId> {
  let groups = hydratedGroups.get(client);

  if (groups == null) {
    groups = new Set<GroupId>();
    hydratedGroups.set(client, groups);
  }

  return groups;
}

function GroupByIdHydrator({ data, children }: { data: GetDetailedGroupByIdQuery | undefined; children: ReactNode }) {
  const client = useApolloClient();

  if (data != null) {
    const groupId = data.getGroup.id as GroupId;
    const hydratedGroupIds = getHydratedGroups(client);

    if (!hydratedGroupIds.has(groupId)) {
      const options = shapeGetDetailedGroupOptions({ groupId });

      const existingData = client.readQuery(options);

      if (existingData == null) {
        client.writeQuery({ ...options, data });
      }

      hydratedGroupIds.add(groupId);
    }
  }

  return children;
}

export { GroupByIdHydrator };
