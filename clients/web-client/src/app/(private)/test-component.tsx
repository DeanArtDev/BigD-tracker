'use client';

import { useApolloClient, useSuspenseQuery } from '@apollo/client/react';
import { ME_QUERY } from '@/entity/user';
import { Button } from '@/shared/ui-kit';

type MeData = {
  me: {
    id: number;
    email: string;
  };
};

function TestComponent() {
  const client = useApolloClient();
  const { error, data, refetch } = useSuspenseQuery<MeData>(ME_QUERY, {
    errorPolicy: 'all',
    context: { endpoint: 'public-cookies-include' },
  });

  return (
    <div>
      <Button variant="outline" onClick={() => refetch()}>
        Refetch Me Query
      </Button>

      <Button variant="outline" onClick={() => client.cache.writeQuery({ query: ME_QUERY, data: { me: null } })}>
        Clear cache
      </Button>

      <Button
        variant="outline"
        onClick={() => {
          throw new Error('Boom!!');
        }}
      >
        Throw error
      </Button>
      {error && JSON.stringify(error, null, 2)}
      {data && (
        <div>
          <p>ID: {data.me.id}</p>
          <p>Email: {data.me.email}</p>
        </div>
      )}
    </div>
  );
}

export { TestComponent };
