import type { ApiDto } from '@/shared/api/types';
import { useQueryClient } from '@tanstack/react-query';
import { trainingsQueryKeys } from '../query';

const useTrainingStartDateUpdate = () => {
  const queryClient = useQueryClient();

  return (data: { id: number; startDate: string }, filters?: { from: string; to: string }) => {
    const keys = trainingsQueryKeys.getTrainings(filters);
    const previous: { data: ApiDto['TrainingAggregationDto'][] } | undefined =
      queryClient.getQueryData(keys);

    queryClient.setQueryData(keys, {
      data: (previous?.data ?? []).map((item) => {
        if (item.id === data.id) {
          return { ...item, startDate: data.startDate };
        }
        return item;
      }),
    });
  };
};

export { useTrainingStartDateUpdate };
