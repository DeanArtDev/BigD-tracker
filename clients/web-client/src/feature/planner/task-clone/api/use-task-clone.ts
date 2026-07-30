import { useMutation } from '@apollo/client/react';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { shapeTaskCloneOptions, useExtendApolloErrorResult } from '@/shared/transport/graphql';

function useTaskClone() {
  const [cloneTask, rest] = useMutation(...shapeTaskCloneOptions());
  const { appErrors } = useExtendApolloErrorResult(rest.error);
  useExceptionNotificator({ exception: appErrors.at(-1) });
  return { cloneTask, ...rest };
}

export { useTaskClone };
