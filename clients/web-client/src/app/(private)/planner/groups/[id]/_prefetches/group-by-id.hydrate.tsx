'use client';

import { useApolloClient } from '@apollo/client/react';
import { ReactNode, useRef } from 'react';
import { GetGroupByIdDocument, GetGroupByIdQuery } from '@/entity/planner/groups';

function GroupByIdHydrator({ data, children }: { data: GetGroupByIdQuery | undefined; children: ReactNode }) {
  const client = useApolloClient();
  const written = useRef(false);

  if (!written.current && data) {
    client.writeQuery({ query: GetGroupByIdDocument, data, variables: { input: { groupId: data.getGroup.id } } });
    written.current = true;
  }
  return children;
}

export { GroupByIdHydrator };
