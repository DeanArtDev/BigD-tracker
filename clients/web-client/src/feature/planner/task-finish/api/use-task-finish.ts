import { useMutation } from '@apollo/client/react';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { shapeTaskFinishOptions, useExtendApolloErrorResult } from '@/shared/transport/graphql';

function useTaskFinish() {
  const [finishTask, rest] = useMutation(...shapeTaskFinishOptions());
  const { appErrors } = useExtendApolloErrorResult(rest.error);
  useExceptionNotificator({ exception: appErrors.at(-1) });
  return { finishTask, ...rest };
}

export { useTaskFinish };
