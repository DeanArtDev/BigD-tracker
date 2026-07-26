import { gql } from '@apollo/client';

const GET_PLANNER_INIT = gql`
  query GetPlannerInit {
    getPlannerInit {
      inboxId
      inboxTaskCount
    }
  }
`;
export { GET_PLANNER_INIT };
