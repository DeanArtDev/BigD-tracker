import { useMutation } from '@apollo/client/react';
import { shapeTaskFinishOptions } from '@/shared/transport/graphql';

function useTaskFinish() {
  const [finishTask, rest] = useMutation(...shapeTaskFinishOptions());

  return { finishTask, ...rest };
}

export { useTaskFinish };
