import { taskDtoToEntity, type TaskEntity } from '@/entity/planner/tasks';
import { $privetQueryClient } from '@/shared/api/api-client';
import type { TaskQueryParams } from '../types';
import { tasksQueryKeys } from './query';

const EMPTY_PLACEHOLDER: TaskEntity[] = [];

function useTasksQuery(params: TaskQueryParams) {
  const { data, ...others } = $privetQueryClient.useInfiniteQuery(
    ...tasksQueryKeys.getTasks(params),
    {
      pageParamName: 'page',
      initialPageParam: 1,
      getNextPageParam: (lastPage, _, lastPageParam) => {
        const lastParams = typeof lastPageParam === 'number' ? lastPageParam : 1;
        return lastPage.data.meta.nextPage ? lastParams + 1 : undefined;
      },
      select: (data) => {
        return {
          ...data,
          allItems: data.pages.flatMap((page) => page.data.items.map(taskDtoToEntity)),
        };
      },
    },
  );

  return {
    pages: data?.pages,
    taskList: data?.allItems ?? EMPTY_PLACEHOLDER,
    isEmpty: data == null || data?.allItems.length <= 0,
    ...others,
  };
}

export { useTasksQuery };
