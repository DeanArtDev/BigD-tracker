import { $privetQueryClient } from '@/shared/api/api-client';
import { trainingsQueryKeys } from './query';

function useActiveTrainingQuery() {
  const { data, error, ...others } = $privetQueryClient.useQuery(
    ...trainingsQueryKeys.getActiveTraining(),
    undefined,
    { gcTime: 0, retry: 1 },
  );

  const isNotFound = isNotFoundError(error);

  return {
    activeTraining: data?.data,
    isEmpty: data?.data == null,
    isNotFound,
    ...others,
  };
}

const isNotFoundError = (error: unknown): error is { statusCode: 404 } => {
  if (typeof error === 'object' && error != null && 'statusCode' in error) {
    if (error.statusCode === 404) {
      return true;
    }
  }
  return false;
};

export { useActiveTrainingQuery };
