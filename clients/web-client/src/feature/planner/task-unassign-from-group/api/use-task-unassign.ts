import { useMutation } from '@apollo/client/react';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { shapeTaskUnassignOptions, useExtendApolloErrorResult } from '@/shared/transport/graphql';

function useTaskUnassign() {
  const [unassignTask, rest] = useMutation(...shapeTaskUnassignOptions({ awaitRefetchQueries: true }));

  const { appErrors } = useExtendApolloErrorResult(rest.error);
  useExceptionNotificator({
    exception: appErrors.at(-1),
  });

  return { unassignTask, ...rest };
}

export { useTaskUnassign };
