import { gql } from '@apollo/client';

const TASK_CREATE_MUTATION = gql`
  mutation CreateTask($input: TaskCreateInput!) {
    createTask(input: $input) {
      id
      name
      description
      deadline
      endDate
      priority
      startDate
      status
      cancelReason
    }
  }
`;

export { TASK_CREATE_MUTATION };
