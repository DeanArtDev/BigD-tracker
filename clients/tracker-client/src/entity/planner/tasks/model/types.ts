import type { ApiEndpoints } from '@/shared/api/types';

type TaskQueryParams = Omit<
  ApiEndpoints['TasksController_getTasks']['parameters']['query'],
  'page'
>;

export type { TaskQueryParams };
