import { useMutation } from '@apollo/client/react';
import { shapeTaskCopyOptions } from '@/shared/transport/graphql';

function useTaskCopy() {
  const [copyTask, rest] = useMutation(...shapeTaskCopyOptions());

  return { copyTask, ...rest };
}

export { useTaskCopy };
