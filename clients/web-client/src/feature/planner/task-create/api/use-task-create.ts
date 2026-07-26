import { useMutation } from '@apollo/client/react';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { shapeTaskCreateOptions, useExtendApolloErrorResult } from '@/shared/transport/graphql';

function useTaskCreate() {
  const [createTask, rest] = useMutation(...shapeTaskCreateOptions());
  const { appErrors } = useExtendApolloErrorResult(rest.error);
  useExceptionNotificator({ exception: appErrors.at(-1) });
  return { createTask, ...rest };
}

export { useTaskCreate };
