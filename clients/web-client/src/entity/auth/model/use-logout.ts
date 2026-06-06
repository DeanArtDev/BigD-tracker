import { useMutation } from '@apollo/client/react';
import { useExtendApolloErrorResult } from '@/shared/transport/graphql';
import { UserLogoutDocument, UserLogoutMutation } from './schemas/schema.generated';

function useLogout() {
  const [logout, rest] = useMutation<UserLogoutMutation>(UserLogoutDocument, {
    context: { endpoint: 'private' },
  });

  return { logout, ...rest, ...useExtendApolloErrorResult(rest.error) };
}

export { useLogout };
