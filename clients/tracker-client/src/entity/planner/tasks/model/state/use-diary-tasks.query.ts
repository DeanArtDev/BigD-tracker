import { taskDtoToEntity, type TaskEntity } from '@/entity/planner/tasks';
import { $privetQueryClient } from '@/shared/api/api-client';
import type { QuerySelectResponse } from '@/shared/api/types';
import { keyBy } from 'lodash-es';
import { tasksDiaryQueryKeys } from './query';

const EMPTY_DIARY_PLACEHOLDER: TaskEntity[] = [];

function useDiaryTasksQuery(params: { filters?: { from: string; to: string } }) {
  const { data, ...others } = $privetQueryClient.useQuery(
    ...tasksDiaryQueryKeys.getDiaryTasks(params.filters!),
    {
      enabled: params.filters != null,
      select: (data): QuerySelectResponse<TaskEntity> => {
        const items = data.data.map(taskDtoToEntity);

        return {
          items,
          byId: keyBy(items, 'id'),
        };
      },
    },
  );

  return {
    taskById: data?.byId,
    tasks: data?.items ?? EMPTY_DIARY_PLACEHOLDER,
    isEmpty: data?.items == null || data.items.length === 0,
    ...others,
  };
}

export { useDiaryTasksQuery };
