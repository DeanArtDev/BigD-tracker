import { gql } from '@apollo/client';

const GROUP_UPDATE_MUTATION = gql`
  mutation UpdateGroup($input: GroupUpdateInput!) {
    updateGroup(input: $input) {
      id
      name
      description
      progress
      status
    }
  }
`;

const GROUP_DELETE_MUTATION = gql`
  mutation DeleteGroup($input: GroupDeleteInput!) {
    groupDelete(input: $input)
  }
`;

const GROUP_CREATE_MUTATION = gql`
  mutation CreateGroup($input: GroupCreateInput!) {
    createGroup(input: $input) {
      id
      name
      description
      status
      progress
    }
  }
`;

const GET_ASSIGNABLE_GROUPS_QUERY = gql`
  query GetAssignableGroups {
    getAssignableGroups {
      id
      name
    }
  }
`;

const GET_GROUP_BY_ID_QUERY = gql`
  query GetGroupById($input: GetGroupInput!) {
    getGroup(input: $input) {
      id
      name
      description
      status
      progress
      taskCount
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
        description
      }

      meta {
        endCursor
        hasNextPage
      }
    }
  }
`;

export {
  GROUP_UPDATE_MUTATION,
  GROUP_DELETE_MUTATION,
  GET_ASSIGNABLE_GROUPS_QUERY,
  GET_GROUP_LIST_QUERY,
  GROUP_CREATE_MUTATION,
  GET_GROUP_BY_ID_QUERY,
};
