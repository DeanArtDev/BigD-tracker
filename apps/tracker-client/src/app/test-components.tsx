import { $privetQueryClient } from '@/shared/api/api-client';
import { Button } from '@/shared/ui-kit/ui/button';
import { useState } from 'react';

function TestComponents() {
  const [, setToken] = useState<string | null>(null);
  const { mutate, data: registerData } = $privetQueryClient.useMutation(
    'post',
    '/auth/register',
    {
      onSuccess: (data) => {
        console.log(1111, data);
        if (data != null) {
          setToken(data.data.token);
        }
      },
    },
  );

  const { mutate: refresh, data: refreshData } = $privetQueryClient.useMutation(
    'post',
    '/auth/refresh',
  );

  const { mutate: logout } = $privetQueryClient.useMutation('post', '/auth/logout');

  return (
    <div>
      <Button
        onClick={() => {
          logout({});
        }}
      >
        logout
      </Button>
      <Button
        onClick={() => {
          mutate({
            body: {
              login: 'efm2fpl3e@example.com',
              password: '1234567',
            },
          });
        }}
      >
        register
      </Button>
      <div className="mb-3">
        <h2>Token</h2>
        {JSON.stringify(registerData, null, 2)}
      </div>

      <hr />

      <div>
        <h2>Refresh</h2>
        {JSON.stringify(refreshData, null, 2)}
      </div>
      <Button
        onClick={() => {
          refresh({});
        }}
      >
        refresh
      </Button>
    </div>
  );
}

export const Component = TestComponents;
