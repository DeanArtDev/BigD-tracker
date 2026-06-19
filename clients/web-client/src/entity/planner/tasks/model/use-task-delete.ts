import { useMutation } from '@apollo/client/react';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { useExtendApolloErrorResult } from '@/shared/transport/graphql';
import { DeleteTaskMutationVariables, DeleteTaskMutation, DeleteTaskDocument } from './schemas/tasks.schema.generated';

function useTaskDelete() {
  const [deleteTask, rest] = useMutation<DeleteTaskMutation, DeleteTaskMutationVariables>(DeleteTaskDocument, {
    context: {
      endpoint: 'private',
    },
  });

  const { appErrors } = useExtendApolloErrorResult(rest.error);
  useExceptionNotificator({ exception: appErrors.at(-1) });

  return { deleteTask, ...rest };
}

export { useTaskDelete };
