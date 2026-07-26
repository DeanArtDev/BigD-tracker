import { useMutation } from '@apollo/client/react';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { shapeUserLogoutOptions, useExtendApolloErrorResult } from '@/shared/transport/graphql';

function useLogout() {
  const [logout, rest] = useMutation(...shapeUserLogoutOptions());

  const { appErrors } = useExtendApolloErrorResult(rest.error);
  useExceptionNotificator({ exception: appErrors.at(-1) });

  return { logout, ...rest };
}

export { useLogout };
