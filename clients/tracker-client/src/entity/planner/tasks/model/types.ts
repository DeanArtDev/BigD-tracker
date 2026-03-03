import type { ApiEndpoints } from '@/shared/api/types';

type TaskQueryParams = Omit<ApiEndpoints['TasksController_getTasks']['parameters']['query'], 'page'>;

type TaskDeletedQueryParams = Omit<ApiEndpoints['TasksController_getDeletedTasks']['parameters']['query'], 'page'>;

type TaskArchivedQueryParams = Omit<ApiEndpoints['TasksController_getArchivedTasks']['parameters']['query'], 'page'>;

export type { TaskQueryParams, TaskDeletedQueryParams, TaskArchivedQueryParams };
