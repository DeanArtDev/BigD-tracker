import { $privetQueryClient } from '@/shared/api/api-client';
import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';
import { useInvalidateTrainingsTemplates } from './invalidators';

function useTrainingDelete() {
  const invalidate = useInvalidateTrainingsTemplates();
  const options = getDefaultQueryNotifications();
  const { mutate: deleteTrigger, ...others } = $privetQueryClient.useMutation(
    'delete',
    '/trainings/{trainingId}',
    {
      ...options,
      onSuccess: async () => {
        await invalidate();
        options.onSuccess();
      },
    },
  );

  return {
    deleteTrigger,
    ...others,
  };
}

export { useTrainingDelete };
