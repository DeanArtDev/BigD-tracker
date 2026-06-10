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
          cancelReason
          deadline
          description
          endDate
          id
          name
          priority
          startDate
          status
          weight
        }
      }
    }
  }
`;

export { GET_INBOX_QUERY };
