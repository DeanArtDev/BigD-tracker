import { useMutation } from '@apollo/client/react';
import { exceptionCode } from '@big-d/exceptions';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { shapeUserLoginOptions, useExtendApolloErrorResult } from '@/shared/transport/graphql';

function useLogin() {
  const [login, rest] = useMutation(...shapeUserLoginOptions());

  const { appErrors } = useExtendApolloErrorResult(rest.error);
  useExceptionNotificator({
    exception: appErrors.at(-1),
    messageHandlers: {
      [exceptionCode.userWrongLoginOrPassword.code]: () => 'Неверный логин или пароль',
    },
  });

  return { login, ...rest };
}

export { useLogin };
