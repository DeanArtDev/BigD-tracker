import { useMutation } from '@apollo/client/react';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { shapeGroupUpdateOptions, useExtendApolloErrorResult } from '@/shared/transport/graphql';

function useGroupUpdate() {
  const [updateGroup, rest] = useMutation(...shapeGroupUpdateOptions());

  const { appErrors } = useExtendApolloErrorResult(rest.error);
  useExceptionNotificator({ exception: appErrors.at(-1) });

  return { updateGroup, ...rest };
}

export { useGroupUpdate };
