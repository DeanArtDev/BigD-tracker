import { useMutation } from '@apollo/client/react';
import { UpdateTaskDocument, UpdateTaskMutation, UpdateTaskMutationVariables } from './schemas/tasks.schema.generated';

function useTaskUpdate() {
  const [updateTask, rest] = useMutation<UpdateTaskMutation, UpdateTaskMutationVariables>(UpdateTaskDocument, {
    context: {
      endpoint: 'private',
    },
  });

  return { updateTask, ...rest };
}

export { useTaskUpdate };
