import { useMutation } from '@apollo/client/react';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { shapeTaskCompleteDeleteOptions, useExtendApolloErrorResult } from '@/shared/transport/graphql';

function useTaskCompleteDelete() {
  const [completeDeleteTask, rest] = useMutation(...shapeTaskCompleteDeleteOptions());
  const { appErrors } = useExtendApolloErrorResult(rest.error);

  useExceptionNotificator({
    exception: appErrors.at(-1),
    messageHandlers: { anyException: () => 'Не удалось полностью удалить дело, попробуйте снова' },
  });

  return { completeDeleteTask, ...rest };
}

export { useTaskCompleteDelete };
