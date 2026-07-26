import { gql } from '@apollo/client';

const GET_INBOX_QUERY = gql`
  query GetInbox($input: GetInboxTasksInput) {
    getInbox {
      id
      name
      tasks(input: $input) {
        meta {
          endCursor
          hasNextPage
        }
        items {
          id
          name
          deadline
          description
          groupId
          priority
          startDate
          status
        }
      }
    }
  }
`;

export { GET_INBOX_QUERY };
