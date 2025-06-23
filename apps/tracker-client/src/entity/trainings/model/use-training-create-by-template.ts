import { $privetQueryClient } from '@/shared/api/api-client';
import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';

function useTrainingCreateByTemplate() {
  const notifications = getDefaultQueryNotifications();
  const { mutate: createTrainingByTemplate, ...others } = $privetQueryClient.useMutation(
    'post',
    '/trainings/templates',
    notifications,
  );

  return {
    createTrainingByTemplate,
    ...others,
  };
}

export { useTrainingCreateByTemplate };
