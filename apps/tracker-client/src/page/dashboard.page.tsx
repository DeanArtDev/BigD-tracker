import { $privetQueryClient } from '@/shared/api/api-client';
import { Button } from '@/shared/ui-kit/ui/button';
import { useLogin, useMe } from '@/entity/auth';

function DashboardPage() {
  const { login } = useLogin();
  const { refetch } = $privetQueryClient.useQuery('get', '/users');
  useMe();

  return (
    <div>
      DashboardPage
      <Button
        onClick={() => {
          refetch();
        }}
      >
        Refetch
      </Button>
      <Button
        onClick={() => {
          login({ body: { login: 'email2@mail.com', password: '1234567890' } });
        }}
      >
        Login
      </Button>
    </div>
  );
}

export const Component = DashboardPage;
