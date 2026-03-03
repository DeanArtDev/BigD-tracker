import { taskDtoToEntity, type TaskEntity } from '@/entity/planner/tasks';
import { $privetQueryClient } from '@/shared/api/api-client';

const EMPTY_PLACEHOLDER: TaskEntity[] = [];

function useTasksDiaryQuery(query?: { from: string; to: string }) {
  const { data, ...others } = $privetQueryClient.useQuery(
    'get',
    '/tasks/diary',
    {
      params: { query: { filter: query } },
      enabled: query != null,
    },
    {
      select: (data) => data?.data.items.map(taskDtoToEntity),
    },
  );

  return {
    taskList: data ?? EMPTY_PLACEHOLDER,
    isEmpty: data == null || data.length <= 0,
    ...others,
  };
}

export { useTasksDiaryQuery };
