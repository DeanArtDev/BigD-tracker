import { $privetQueryClient } from '@/shared/api/api-client';
import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';

function useTrainingCreateByTemplate() {
  const options = getDefaultQueryNotifications();
  const { mutate: createTrainingByTemplate, ...others } = $privetQueryClient.useMutation(
    'post',
    '/trainings/templates',
    { onError: options.onError },
  );

  return {
    createTrainingByTemplate,
    ...others,
  };
}

export { useTrainingCreateByTemplate };
