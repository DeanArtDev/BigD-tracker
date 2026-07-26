import { useMutation } from '@apollo/client/react';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { shapeTaskDeleteOptions, useExtendApolloErrorResult } from '@/shared/transport/graphql';

function useTaskDelete() {
  const [deleteTask, rest] = useMutation(...shapeTaskDeleteOptions());
  const { appErrors } = useExtendApolloErrorResult(rest.error);
  useExceptionNotificator({ exception: appErrors.at(-1) });
  return { deleteTask, ...rest };
}

export { useTaskDelete };
