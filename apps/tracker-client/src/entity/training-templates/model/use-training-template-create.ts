import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';
import { $privetQueryClient } from '@/shared/api/api-client';

function useTrainingTemplateCreate() {
  const options = getDefaultQueryNotifications();

  const { mutate: createTrainingTemplates, ...others } = $privetQueryClient.useMutation(
    'post',
    '/trainings/templates',
    {
      ...options,
    },
  );

  return {
    createTrainingTemplates,
    ...others,
  };
}

export { useTrainingTemplateCreate };
