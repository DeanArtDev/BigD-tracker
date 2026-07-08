import { useMutation } from '@apollo/client/react';
import { CopyTaskDocument, CopyTaskMutation, CopyTaskMutationVariables } from './schemas/tasks.schema.generated';

function useTaskCopy() {
  const [copyTask, rest] = useMutation<CopyTaskMutation, CopyTaskMutationVariables>(CopyTaskDocument, {
    context: {
      endpoint: 'private',
    },
  });

  return { copyTask, ...rest };
}

export { useTaskCopy };
