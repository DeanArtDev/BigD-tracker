import { $privetQueryClient } from '@/shared/api/api-client';
import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';

function useTrainingTemplateUpdate() {
  const options = getDefaultQueryNotifications();
  const { mutate: updateTrainingTemplates, ...others } = $privetQueryClient.useMutation(
    'put',
    '/trainings/templates',
    {
      ...options,
    },
  );

  return {
    updateTrainingTemplates,
    ...others,
  };
}

export { useTrainingTemplateUpdate };
