import { gql } from '@apollo/client';

const GET_ASSIGNABLE_GROUPS_QUERY = gql`
  query GetAssignableGroups {
    getAssignableGroups {
      id
      name
    }
  }
`;

const GET_GROUP_LIST_QUERY = gql`
  query GetGroupList($input: GetGroupListInput!) {
    getGroupList(input: $input) {
      items {
        id
        name
        status
      }

      meta {
        endCursor
        hasNextPage
      }
    }
  }
`;

export { GET_ASSIGNABLE_GROUPS_QUERY };
