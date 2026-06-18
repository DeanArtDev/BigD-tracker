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

const TASK_DELETE_MUTATION = gql`
  mutation DeleteTask($input: TaskDeleteInput!) {
    deleteTask(input: $input) {
      id
    }
  }
`;

export { TASK_CREATE_MUTATION, TASK_DELETE_MUTATION };
