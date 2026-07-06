import { gql } from '@apollo/client';

const TASK_CREATE_MUTATION = gql`
  mutation CreateTask($input: TaskCreateInput!) {
    createTask(input: $input) {
      id
      name
      description
      deadline
      priority
      startDate
      status
    }
  }
`;

const TASK_UPDATE_MUTATION = gql`
  mutation UpdateTask($input: TaskUpdateInput!) {
    updateTask(input: $input) {
      id
      name
      description
      deadline
      priority
      startDate
      status
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

const TASK_ASSIGN_MUTATION = gql`
  mutation TaskAssign($input: TaskAssignInput!) {
    assignTaskToGroup(input: $input)
  }
`;

const TASK_UNASSIGN_MUTATION = gql`
  mutation TaskUnassign($input: TaskUnassignInput!) {
    unassignTaskToGroup(input: $input)
  }
`;

export { TASK_CREATE_MUTATION, TASK_DELETE_MUTATION, TASK_ASSIGN_MUTATION, TASK_UNASSIGN_MUTATION };
