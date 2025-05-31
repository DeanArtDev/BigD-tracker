import { $privetQueryClient } from '@/shared/api/api-client';
import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';
import { useInvalidateTrainingsTemplates } from './invalidators';

function useTrainingTemplateUpdateAndReplace() {
  const invalidate = useInvalidateTrainingsTemplates();
  const options = getDefaultQueryNotifications();
  const { mutate: update, ...others } = $privetQueryClient.useMutation(
    'put',
    '/trainings/templates/{templateId}',
    {
      ...options,
      onSuccess: async () => {
        await invalidate();
        options.onSuccess();
      },
    },
  );

  return {
    update,
    ...others,
  };
}

export { useTrainingTemplateUpdateAndReplace };
