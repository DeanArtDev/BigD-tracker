import { useMutation } from '@apollo/client/react';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { useExtendApolloErrorResult } from '@/shared/transport/graphql';
import { CreateTaskDocument, CreateTaskMutation, CreateTaskMutationVariables } from './schemas/tasks.schema.generated';

function useTaskCreate() {
  const [createTask, rest] = useMutation<CreateTaskMutation, CreateTaskMutationVariables>(CreateTaskDocument, {
    context: {
      endpoint: 'private',
    },
  });

  const { appErrors } = useExtendApolloErrorResult(rest.error);
  useExceptionNotificator({ exception: appErrors.at(-1) });

  return { createTask, ...rest };
}

export { useTaskCreate };
