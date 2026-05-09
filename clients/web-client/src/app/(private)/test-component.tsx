'use client';

import { useQuery } from '@apollo/client/react';
import { ME_QUERY } from '@/entity/user';
import { Button } from '@/shared/ui-kit';

type MeData = {
  me: {
    id: number;
    email: string;
  };
};

function TestComponent() {
  const { data, refetch } = useQuery<MeData>(ME_QUERY);

  return (
    <div>
      <Button onClick={() => refetch()}>Refetch Me Query</Button>
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
