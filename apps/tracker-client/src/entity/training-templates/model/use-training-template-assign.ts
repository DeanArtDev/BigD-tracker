import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';
import { $privetQueryClient } from '@/shared/api/api-client';

function useTrainingTemplateAssign() {
  const options = getDefaultQueryNotifications();

  const { mutate: assignTrainingTemplates, ...others } = $privetQueryClient.useMutation(
    'post',
    '/trainings/templates/assign',
    {
      ...options,
    },
  );

  return {
    assignTrainingTemplates,
    ...others,
  };
}

export { useTrainingTemplateAssign };
