import { useMutation } from '@apollo/client/react';
import { useExtendApolloErrorResult } from '@/shared/transport/graphql';
import { DeleteTaskMutationVariables, DeleteTaskMutation, DeleteTaskDocument } from './schemas/tasks.schema.generated';

function useTaskDelete() {
  const [deleteTask, rest] = useMutation<DeleteTaskMutation, DeleteTaskMutationVariables>(DeleteTaskDocument, {
    context: {
      endpoint: 'private',
    },
  });

  return { deleteTask, ...rest, ...useExtendApolloErrorResult(rest.error) };
}

export { useTaskDelete };
