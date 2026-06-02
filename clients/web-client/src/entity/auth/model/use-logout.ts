import { useAppMutation } from '@/shared/transport/graphql';
import { UserLogoutDocument, UserLogoutMutation } from './schemas/schema.generated';

function useLogout() {
  const [logout, rest] = useAppMutation<UserLogoutMutation>(UserLogoutDocument, {
    endpoint: 'private',
  });

  return { logout, ...rest };
}

export { useLogout };
