import { $privetQueryClient } from '@/shared/api/api-client';
import { isEmpty } from 'lodash-es';
import { tasksQueryKeys } from './query';

function useAssignableTasksQuery(params: { search: string }, options: { staleTime?: number; gcTime?: number } = {}) {
  const { data, ...others } = $privetQueryClient.useQuery(...tasksQueryKeys.assignableTasks(params), {
    enabled: !isEmpty(params.search),
    ...options,
  });

  return {
    tasks: data?.data ?? [],
    isEmpty: data?.data == null || data.data.length === 0,
    ...others,
  };
}

export { useAssignableTasksQuery };
