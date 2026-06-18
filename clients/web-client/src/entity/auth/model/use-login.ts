import { useMutation } from '@apollo/client/react';
import { exceptionCode } from '@big-d/exceptions';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { useExtendApolloErrorResult } from '@/shared/transport/graphql';
import { UserLoginDocument, UserLoginMutation, UserLoginMutationVariables } from './schemas/auth.schema.generated';

function useLogin() {
  const [login, rest] = useMutation<UserLoginMutation, UserLoginMutationVariables>(UserLoginDocument, {
    context: {
      endpoint: 'public-cookies-include',
    },
  });

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
