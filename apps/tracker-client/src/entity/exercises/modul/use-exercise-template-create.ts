import { $privetQueryClient } from '@/shared/api/api-client';
import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';

function useExerciseTemplateCreate() {
  const options = getDefaultQueryNotifications();
  const { mutate: create, ...others } = $privetQueryClient.useMutation(
    'post',
    '/exercises/templates',
    options,
  );

  return {
    create,
    ...others,
  };
}

export { useExerciseTemplateCreate };
