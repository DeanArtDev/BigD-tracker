import { useMutation } from '@apollo/client/react';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { shapeTaskSettingsUpdateOptions, useExtendApolloErrorResult } from '@/shared/transport/graphql';

function useTaskSettingsUpdate() {
  const [updateTaskSettings, rest] = useMutation(...shapeTaskSettingsUpdateOptions());
  const { appErrors } = useExtendApolloErrorResult(rest.error);

  useExceptionNotificator({
    exception: appErrors.at(-1),
    messageHandlers: {
      anyException: () => 'Не удалось обновить настройки дела, попробуйте еще раз',
    },
  });

  return { updateTaskSettings, ...rest };
}

export { useTaskSettingsUpdate };
