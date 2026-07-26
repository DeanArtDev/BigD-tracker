import { useMutation } from '@apollo/client/react';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { shapeTaskCopyOptions, useExtendApolloErrorResult } from '@/shared/transport/graphql';

function useTaskCopy() {
  const [copyTask, rest] = useMutation(...shapeTaskCopyOptions());
  const { appErrors } = useExtendApolloErrorResult(rest.error);
  useExceptionNotificator({ exception: appErrors.at(-1) });
  return { copyTask, ...rest };
}

export { useTaskCopy };
