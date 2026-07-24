import { gql } from '@apollo/client';

const GET_DETAILED_GROUP_QUERY = gql`
  query GetDetailedGroupById($input: GetGroupInput!, $tasksInput: GetGroupTasksInput) {
    getGroup(input: $input) {
      id
      name
      description
      status
      progress
      tasks(input: $tasksInput) {
        items {
          id
          name
          status
          priority
          description
          startDate
          deadline
          endDate
          cancelReason
          groupId
        }
      }
    }
  }
`;

export { GET_DETAILED_GROUP_QUERY };
