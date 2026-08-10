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
          ...TaskFragment
        }
      }
    }
  }
`;

export { GET_INBOX_QUERY };
