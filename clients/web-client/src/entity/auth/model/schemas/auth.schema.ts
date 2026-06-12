import { gql } from '@apollo/client';

const USER_LOGIN_MUTATION = gql`
  mutation UserLogin($input: LoginUserInput!) {
    userLogin(input: $input)
  }
`;

const USER_LOGOUT_MUTATION = gql`
  mutation UserLogout {
    userLogout
  }
`;

export { USER_LOGIN_MUTATION, USER_LOGOUT_MUTATION };
