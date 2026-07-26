import { useMutation } from '@apollo/client/react';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { shapeGroupCreateOptions, useExtendApolloErrorResult } from '@/shared/transport/graphql';

function useGroupCreate() {
  const [createGroup, rest] = useMutation(...shapeGroupCreateOptions());

  const { appErrors } = useExtendApolloErrorResult(rest.error);
  useExceptionNotificator({ exception: appErrors.at(-1) });

  return { createGroup, ...rest };
}

export { useGroupCreate };
