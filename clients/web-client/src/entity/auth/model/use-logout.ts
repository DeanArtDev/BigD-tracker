import { useMutation } from '@apollo/client/react';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { useExtendApolloErrorResult } from '@/shared/transport/graphql';
import { UserLogoutDocument, UserLogoutMutation } from './schemas/auth.schema.generated';

function useLogout() {
  const [logout, rest] = useMutation<UserLogoutMutation>(UserLogoutDocument, {
    context: { endpoint: 'private' },
  });

  const { appErrors } = useExtendApolloErrorResult(rest.error);
  useExceptionNotificator({ exception: appErrors.at(-1) });

  return { logout, ...rest };
}

export { useLogout };
