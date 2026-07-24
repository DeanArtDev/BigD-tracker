'use client';

import { useApolloClient } from '@apollo/client/react';
import { ReactNode, useRef } from 'react';
import { GroupId } from '@/entity/planner/groups';
import { GetDetailedGroupByIdQuery, shapeGetDetailedGroupOptions } from '../_api';

function GroupByIdHydrator({ data, children }: { data: GetDetailedGroupByIdQuery | undefined; children: ReactNode }) {
  const client = useApolloClient();
  const written = useRef(false);

  if (!written.current && data) {
    client.writeQuery({
      data,
      ...shapeGetDetailedGroupOptions({ groupId: data.getGroup.id as GroupId }),
    });
    written.current = true;
  }
  return children;
}

export { GroupByIdHydrator };
