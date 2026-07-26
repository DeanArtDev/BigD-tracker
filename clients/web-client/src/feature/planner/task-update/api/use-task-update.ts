import { useMutation } from '@apollo/client/react';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { shapeTaskUpdateOptions, useExtendApolloErrorResult } from '@/shared/transport/graphql';

function useTaskUpdate() {
  const [updateTask, rest] = useMutation(...shapeTaskUpdateOptions());
  const { appErrors } = useExtendApolloErrorResult(rest.error);
  useExceptionNotificator({ exception: appErrors.at(-1) });
  return { updateTask, ...rest };
}

export { useTaskUpdate };
