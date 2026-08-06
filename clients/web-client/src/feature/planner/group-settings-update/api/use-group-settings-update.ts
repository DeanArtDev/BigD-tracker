import { useMutation } from '@apollo/client/react';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { shapeGroupSettingsUpdateOptions, useExtendApolloErrorResult } from '@/shared/transport/graphql';

function useGroupSettingsUpdate() {
  const [updateGroupSettings, rest] = useMutation(...shapeGroupSettingsUpdateOptions());
  const { appErrors } = useExtendApolloErrorResult(rest.error);

  useExceptionNotificator({ exception: appErrors.at(-1) });

  return { updateGroupSettings, ...rest };
}

export { useGroupSettingsUpdate };
