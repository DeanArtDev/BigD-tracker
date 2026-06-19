import { useMutation } from '@apollo/client/react';
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

  return { unassignTask, ...rest };
}

export { useTaskUnassign };
