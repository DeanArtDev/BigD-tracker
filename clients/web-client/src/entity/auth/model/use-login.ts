import { exceptionCode } from '@big-d/exceptions';
import { useAppMutation } from '@/shared/transport/graphql';
import { UserLoginDocument, UserLoginMutation } from './schemas/queries.generated';

export type LoginVariables = {
  input: {
    email: string;
    password: string;
  };
};

function useLogin() {
  const [login, { loading, hasError }] = useAppMutation<UserLoginMutation, LoginVariables>(UserLoginDocument, {
    endpoint: 'public-cookies-include',
  });

  const isWrongPassOrLoginError = hasError({ code: exceptionCode.userWrongLoginOrPassword.code });

  return { login, isWrongPassOrLoginError, isPending: loading };
}

export { useLogin };
