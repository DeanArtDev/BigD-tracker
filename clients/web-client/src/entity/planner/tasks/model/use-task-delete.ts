import { useMutation } from '@apollo/client/react';
import { DeleteTaskMutationVariables, DeleteTaskMutation, DeleteTaskDocument } from './schemas/tasks.schema.generated';

function useTaskDelete() {
  const [deleteTask, rest] = useMutation<DeleteTaskMutation, DeleteTaskMutationVariables>(DeleteTaskDocument, {
    context: {
      endpoint: 'private',
    },
  });

  return { deleteTask, ...rest };
}

export { useTaskDelete };
