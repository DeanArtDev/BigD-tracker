import { gql } from '@apollo/client';

const SIDEBAR_INFO_QUERY = gql`
  query GetSidebarInfoQuery {
    getInbox {
      id
      taskCount
    }
  }
`;

export { SIDEBAR_INFO_QUERY };
