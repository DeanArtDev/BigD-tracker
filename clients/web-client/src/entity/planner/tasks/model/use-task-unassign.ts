import { useMutation } from '@apollo/client/react';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { useExtendApolloErrorResult } from '@/shared/transport/graphql';
import {
  TaskUnassignDocument,
  TaskUnassignMutation,
  TaskUnassignMutationVariables,
} from './schemas/tasks.schema.generated';

function useTaskUnassign() {
  const [unassignTask, rest] = useMutation<TaskUnassignMutation, TaskUnassignMutationVariables>(TaskUnassignDocument, {
    context: {
      endpoint: 'private',
    },
  });

  const { appErrors } = useExtendApolloErrorResult(rest.error);
  useExceptionNotificator({
    exception: appErrors.at(-1),
  });

  return { unassignTask, ...rest };
}

export { useTaskUnassign };
