import { $privetQueryClient } from '@/shared/api/api-client';
import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';

function useExerciseTemplateUpdate() {
  const options = getDefaultQueryNotifications();
  const { mutate: update, ...others } = $privetQueryClient.useMutation(
    'put',
    '/exercises/templates',
    options,
  );

  return {
    update,
    ...others,
  };
}

export { useExerciseTemplateUpdate };
