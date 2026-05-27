'use client';

import { useApolloClient } from '@apollo/client/react';
import { ReactNode, useRef } from 'react';
import { ME_QUERY } from '@/entity/user';

function MeCacheHydrator({ data, children }: { data: unknown; children: ReactNode }) {
  const client = useApolloClient();
  const written = useRef(false);

  // eslint-disable-next-line react-hooks/refs
  if (!written.current && data) {
    client.writeQuery({ query: ME_QUERY, data });
    written.current = true;
  }
  return <>{children}</>;
}

export { MeCacheHydrator };
