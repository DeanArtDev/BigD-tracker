import type { TaskDeletedQueryParams, TaskQueryParams } from '../types';

const tasksQueryKeys = {
  mainKey: ['get', '/tasks'] as const,
  deletedKey: ['get', '/tasks/deleted'] as const,
  assignableTasksKey: ['get', '/tasks/assignable'] as const,
  getTasks: (query: TaskQueryParams) => {
    return [...tasksQueryKeys.mainKey, { params: { query: { page: 1, ...query } } }] as const;
  },
  getTasksDeleted: (query: TaskDeletedQueryParams) => {
    return [...tasksQueryKeys.deletedKey, { params: { query: { page: 1, ...query } } }] as const;
  },
  assignableTasks: (params: { search: string }) => {
    return [...tasksQueryKeys.assignableTasksKey, { params: { query: params } }] as const;
  },
};

export { tasksQueryKeys };
