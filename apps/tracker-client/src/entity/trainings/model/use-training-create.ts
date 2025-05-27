import { $privetQueryClient } from '@/shared/api/api-client';
import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';
import { useInvalidateTrainingsTemplates } from './invalidators';

function useTrainingCreate() {
  const invalidate = useInvalidateTrainingsTemplates();
  const options = getDefaultQueryNotifications();
  const { mutate: create, ...others } = $privetQueryClient.useMutation(
    'post',
    '/trainings',
    {
      ...options,
      onSuccess: async () => {
        await invalidate();
        options.onSuccess();
      },
    },
  );

  return {
    create,
    ...others,
  };
}

export { useTrainingCreate };
