import { useMutation } from '@apollo/client/react';
import { shapeTaskDeleteOptions } from '@/shared/transport/graphql';

function useTaskDelete() {
  const [deleteTask, rest] = useMutation(...shapeTaskDeleteOptions());

  return { deleteTask, ...rest };
}

export { useTaskDelete };
