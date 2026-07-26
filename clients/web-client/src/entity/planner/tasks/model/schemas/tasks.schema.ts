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
      groupId
    }
  }
`;

const TASK_UPDATE_MUTATION = gql`
  mutation UpdateTask($input: TaskUpdateInput!) {
    updateTask(input: $input) {
      id
      name
      description
      cancelReason
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
    assignTaskToGroup(input: $input) {
      id
      groupId
    }
  }
`;

const TASK_UNASSIGN_MUTATION = gql`
  mutation TaskUnassign($input: TaskUnassignInput!) {
    unassignTaskToGroup(input: $input) {
      id
      groupId
    }
  }
`;

const TASK_FINISH_MUTATION = gql`
  mutation TaskFinish($input: TaskFinishInput!) {
    finishTask(input: $input) {
      id
      status
      cancelReason
    }
  }
`;

const TASK_BY_ID_QUERY = gql`
  query TaskById($input: GetTaskByIdInput!) {
    getTaskById(input: $input) {
      id
      name
      description
      priority
      endDate
      status
      startDate
      deadline
      groupId
    }
  }
`;

export {
  TASK_CREATE_MUTATION,
  TASK_DELETE_MUTATION,
  TASK_ASSIGN_MUTATION,
  TASK_UNASSIGN_MUTATION,
  TASK_BY_ID_QUERY,
  TASK_FINISH_MUTATION,
  TASK_UPDATE_MUTATION,
};
