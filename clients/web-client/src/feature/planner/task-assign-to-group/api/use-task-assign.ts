import { useMutation } from '@apollo/client/react';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { shapeTaskAssignOptions, useExtendApolloErrorResult } from '@/shared/transport/graphql';

function useTaskAssign() {
  const [assignTask, rest] = useMutation(...shapeTaskAssignOptions({ awaitRefetchQueries: true }));

  const { appErrors } = useExtendApolloErrorResult(rest.error);
  useExceptionNotificator({
    exception: appErrors.at(-1),
    messageHandlers: { anyException: () => 'Не удалось дело к группе, попробуйте снова.' },
  });

  return { assignTask, ...rest };
}

export { useTaskAssign };
