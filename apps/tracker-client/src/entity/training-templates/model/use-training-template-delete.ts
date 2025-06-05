import { $privetQueryClient } from '@/shared/api/api-client';
import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';

function useTrainingTemplateDelete() {
  const options = getDefaultQueryNotifications();
  const { mutate: deleteTrainingTemplate, ...others } = $privetQueryClient.useMutation(
    'delete',
    '/trainings/templates/{templateId}',
    {
      ...options,
    },
  );

  return {
    deleteTrainingTemplate,
    ...others,
  };
}

export { useTrainingTemplateDelete };
