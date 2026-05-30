'use client';

import { useApolloClient } from '@apollo/client/react';
import { ReactNode, useRef } from 'react';
import { MeDocument, MeQuery } from '@/entity/user';

function MeCacheHydrator({ data, children }: { data: MeQuery | undefined; children: ReactNode }) {
  const client = useApolloClient();
  const written = useRef(false);

  // eslint-disable-next-line react-hooks/refs
  if (!written.current && data) {
    client.writeQuery({ query: MeDocument, data });
    written.current = true;
  }
  return <>{children}</>;
}

export { MeCacheHydrator };
