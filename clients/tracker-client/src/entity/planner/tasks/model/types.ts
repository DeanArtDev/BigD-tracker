import type { ApiEndpoints } from '@/shared/api/types';

type TaskQueryParams = ApiEndpoints['TasksController_getTasks']['parameters']['query'];

export type { TaskQueryParams };
