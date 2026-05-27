import { gql } from '@apollo/client';
import { exceptionCode } from '@big-d/exceptions';
import { useAppMutation } from '@/shared/transport/graphql';

export type LoginVariables = {
  input: {
    email: string;
    password: string;
  };
};

export const USER_LOGIN_MUTATION = gql`
  mutation UserLogin($input: LoginUserInput!) {
    userLogin(input: $input)
  }
`;

function useLogin() {
  const [login, { loading, hasError }] = useAppMutation<{ userLogin: boolean }, LoginVariables>(USER_LOGIN_MUTATION, {
    endpoint: 'public-cookies-include',
  });

  const isWrongPassOrLoginError = hasError({ code: exceptionCode.userWrongLoginOrPassword.code });

  return { login, isWrongPassOrLoginError, isPending: loading };
}

export { useLogin };
