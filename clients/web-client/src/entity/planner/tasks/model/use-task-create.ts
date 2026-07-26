import { useMutation } from '@apollo/client/react';
import { shapeTaskCreateOptions } from '@/shared/transport/graphql';

function useTaskCreate() {
  const [createTask, rest] = useMutation(...shapeTaskCreateOptions());

  return { createTask, ...rest };
}

export { useTaskCreate };
