import { $privetQueryClient } from '@/shared/api/api-client';
import { tasksDiaryQueryKeys } from './query';

function useGetDiaryTasks(params: { filters?: { from: string; to: string } }) {
  const { data, ...others } = $privetQueryClient.useQuery(
    ...tasksDiaryQueryKeys.getDiaryTasks(params.filters!),
    { enabled: params.filters != null },
  );

  return {
    things: data?.data ?? [],
    isEmpty: data?.data == null || data.data.length === 0,
    ...others,
  };
}

export { useGetDiaryTasks };
