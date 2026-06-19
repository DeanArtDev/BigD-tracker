import { gql } from '@apollo/client';

const GET_ASSIGNABLE_GROUPS_QUERY = gql`
  query GetAssignableGroups {
    getAssignableGroups {
      id
      name
    }
  }
`;

export { GET_ASSIGNABLE_GROUPS_QUERY };
