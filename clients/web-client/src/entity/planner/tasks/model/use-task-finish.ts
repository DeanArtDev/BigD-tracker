import { useMutation } from '@apollo/client/react';
import { TaskFinishDocument, TaskFinishMutation, TaskFinishMutationVariables } from './schemas/tasks.schema.generated';

function useTaskFinish() {
  const [finishTask, rest] = useMutation<TaskFinishMutation, TaskFinishMutationVariables>(TaskFinishDocument, {
    context: {
      endpoint: 'private',
    },
  });

  return { finishTask, ...rest };
}

export { useTaskFinish };
