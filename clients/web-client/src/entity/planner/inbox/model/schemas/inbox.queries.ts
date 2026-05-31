import { gql } from '@apollo/client';

const GET_INBOX_QUERY = gql`
  query GetInbox {
    getInbox {
      id
      name
      tasks {
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
`;

export { GET_INBOX_QUERY };
