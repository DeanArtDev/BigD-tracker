import { useMutation } from '@apollo/client/react';
import { GroupId } from '@/entity/planner/groups';
import { TaskId } from '@/entity/planner/tasks';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { shapeTaskUpdateOptions, useExtendApolloErrorResult } from '@/shared/transport/graphql';

function useTaskUpdate() {
  const [updateTask, rest] = useMutation(...shapeTaskUpdateOptions<TaskId, GroupId>());
  const { appErrors } = useExtendApolloErrorResult(rest.error);
  useExceptionNotificator({
    exception: appErrors.at(-1),
    messageHandlers: {
      anyException: () => 'Не удалось обновить дело, попробуйте еще раз',
    },
  });
  return { updateTask, ...rest };
}

export { useTaskUpdate };
