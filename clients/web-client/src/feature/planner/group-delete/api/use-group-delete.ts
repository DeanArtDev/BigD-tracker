import { useMutation } from '@apollo/client/react';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { shapeGroupDeleteOptions, useExtendApolloErrorResult } from '@/shared/transport/graphql';

function useGroupDelete() {
  const [deleteGroup, rest] = useMutation(...shapeGroupDeleteOptions());

  const { appErrors } = useExtendApolloErrorResult(rest.error);
  useExceptionNotificator({ exception: appErrors.at(-1) });

  return { deleteGroup, ...rest };
}

export { useGroupDelete };
