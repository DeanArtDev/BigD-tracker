import { gql } from '@apollo/client';

const GET_ASSIGNABLE_TASKS_QUERY = gql`
  query GetAssignableTasks($input: GetAssignableTasksInput!) {
    getAssignableTasks(input: $input) {
      id
      name
      groupId
      priority
    }
  }
`;

const TASK_CREATE_MUTATION = gql`
  mutation CreateTask($input: TaskCreateInput!) {
    createTask(input: $input) {
      ...TaskFragment
    }
  }
`;

const TASK_COPY_MUTATION = gql`
  mutation CopyTask($input: TaskCopyInput!) {
    copyTask(input: $input) {
      ...TaskFragment
    }
  }
`;

const TASK_UPDATE_MUTATION = gql`
  mutation UpdateTask($input: TaskUpdateInput!) {
    updateTask(input: $input) {
      ...TaskFragment
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
      ...TaskFragment
    }
  }
`;

export {
  TASK_CREATE_MUTATION,
  TASK_DELETE_MUTATION,
  TASK_ASSIGN_MUTATION,
  TASK_UNASSIGN_MUTATION,
  TASK_COPY_MUTATION,
  TASK_BY_ID_QUERY,
  TASK_FINISH_MUTATION,
  TASK_UPDATE_MUTATION,
  GET_ASSIGNABLE_TASKS_QUERY,
};
