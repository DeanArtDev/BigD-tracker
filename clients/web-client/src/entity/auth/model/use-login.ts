import { useMutation } from '@apollo/client/react';
import { exceptionCode } from '@big-d/exceptions';
import { useExtendApolloErrorResult } from '@/shared/transport/graphql';
import { UserLoginDocument, UserLoginMutation } from './schemas/schema.generated';

export type LoginVariables = {
  input: {
    email: string;
    password: string;
  };
};

function useLogin() {
  const [login, rest] = useMutation<UserLoginMutation, LoginVariables>(UserLoginDocument, {
    context: {
      endpoint: 'public-cookies-include',
    },
  });

  const { hasError, ...errorRest } = useExtendApolloErrorResult(rest.error);

  const isWrongPassOrLoginError = hasError({ code: exceptionCode.userWrongLoginOrPassword.code });

  return { login, ...rest, isWrongPassOrLoginError, hasError, ...errorRest };
}

export { useLogin };
