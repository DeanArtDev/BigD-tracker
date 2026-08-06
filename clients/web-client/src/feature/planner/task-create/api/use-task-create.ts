import { useMutation } from '@apollo/client/react';
import { TaskId } from '@/entity/planner/tasks';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { shapeTaskCreateOptions, useExtendApolloErrorResult } from '@/shared/transport/graphql';

function useTaskCreate() {
  const [createTask, rest] = useMutation(...shapeTaskCreateOptions<TaskId>());
  const { appErrors } = useExtendApolloErrorResult(rest.error);
  useExceptionNotificator({
    exception: appErrors.at(-1),
    messageHandlers: {
      anyException: () => 'Не удалось создать дело, попробуйте еще раз',
    },
  });
  return { createTask, ...rest };
}

export { useTaskCreate };
