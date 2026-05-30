import { gql } from '@apollo/client';

const USER_LOGIN_MUTATION = gql`
  mutation UserLogin($input: LoginUserInput!) {
    userLogin(input: $input)
  }
`;

export { USER_LOGIN_MUTATION };
