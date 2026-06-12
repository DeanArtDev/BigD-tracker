import { useMutation } from '@apollo/client/react';
import { useExtendApolloErrorResult } from '@/shared/transport/graphql';
import { CreateTaskDocument, CreateTaskMutation, CreateTaskMutationVariables } from './schemas/tasks.schema.generated';

function useTaskCreate() {
  const [createTask, rest] = useMutation<CreateTaskMutation, CreateTaskMutationVariables>(CreateTaskDocument, {
    context: {
      endpoint: 'private',
    },
  });

  return { createTask, ...rest, ...useExtendApolloErrorResult(rest.error) };
}

export { useTaskCreate };
