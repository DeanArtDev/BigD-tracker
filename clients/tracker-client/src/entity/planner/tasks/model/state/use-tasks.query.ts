import { taskDtoToEntity, type TaskEntity } from '@/entity/planner/tasks';
import { $privetQueryClient } from '@/shared/api/api-client';
import type { QuerySelectResponse } from '@/shared/api/types';
import { keyBy } from 'lodash-es';
import type { TaskQueryParams } from '../types';
import { tasksQueryKeys } from './query';

const EMPTY_DIARY_PLACEHOLDER: TaskEntity[] = [];

function useTasksQuery(params?: TaskQueryParams) {
  const { data, ...others } = $privetQueryClient.useQuery(...tasksQueryKeys.getTasks(params), {
    select: (data): QuerySelectResponse<TaskEntity> => {
      const items = data.data.map(taskDtoToEntity);

      return {
        items,
        byId: keyBy(items, 'id'),
      };
    },
  });

  return {
    taskById: data?.byId,
    tasks: data?.items ?? EMPTY_DIARY_PLACEHOLDER,
    isEmpty: data?.items == null || data.items.length === 0,
    ...others,
  };
}

export { useTasksQuery };
