import { gql } from '@apollo/client';

const GET_ASSIGNABLE_TASKS_QUERY = gql`
  query GetAssignableTasks($input: GetAssignableTasksInput!) {
    getAssignableTasks(input: $input) {
      id
      name
      groupId
      priority
    }
  }
`;

export { GET_ASSIGNABLE_TASKS_QUERY };
