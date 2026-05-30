import { gql } from '@apollo/client';

const ME_QUERY = gql`
  query Me {
    me {
      id
      email
    }
  }
`;

export { ME_QUERY };
