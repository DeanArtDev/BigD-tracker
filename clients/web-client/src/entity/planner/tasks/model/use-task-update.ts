import { useMutation } from '@apollo/client/react';
import { shapeTaskUpdateOptions } from '@/shared/transport/graphql';

function useTaskUpdate() {
  const [updateTask, rest] = useMutation(...shapeTaskUpdateOptions());

  return { updateTask, ...rest };
}

export { useTaskUpdate };
