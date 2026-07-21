'use client';

import { useApolloClient } from '@apollo/client/react';
import { ReactNode, useRef } from 'react';
import { GetDetailedGroupByIdQuery, GetDetailedGroupByIdDocument } from '../_api';

function GroupByIdHydrator({ data, children }: { data: GetDetailedGroupByIdQuery | undefined; children: ReactNode }) {
  const client = useApolloClient();
  const written = useRef(false);

  if (!written.current && data) {
    client.writeQuery({
      query: GetDetailedGroupByIdDocument,
      data,
      variables: { input: { groupId: data.getGroup.id } },
    });
    written.current = true;
  }
  return children;
}

export { GroupByIdHydrator };
