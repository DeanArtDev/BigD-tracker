import { useMutation } from '@apollo/client/react';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { useExtendApolloErrorResult } from '@/shared/transport/graphql';
import { TaskAssignDocument, TaskAssignMutation, TaskAssignMutationVariables } from './schemas/tasks.schema.generated';

function useTaskAssign() {
  const [assignTask, rest] = useMutation<TaskAssignMutation, TaskAssignMutationVariables>(TaskAssignDocument, {
    context: {
      endpoint: 'private',
    },
  });

  const { appErrors } = useExtendApolloErrorResult(rest.error);
  useExceptionNotificator({ exception: appErrors.at(-1) });

  return { assignTask, ...rest };
}

export { useTaskAssign };
