import { $privetQueryClient } from '@/shared/api/api-client';
import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';
import { useInvalidateExerciseTemplates } from './invalidators';

function useExerciseTemplateUpdate() {
  const invalidate = useInvalidateExerciseTemplates();
  const options = getDefaultQueryNotifications();
  const { mutate: update, ...others } = $privetQueryClient.useMutation(
    'put',
    '/exercises/templates/{templateId}',
    {
      ...options,
      onSuccess: async () => {
        await invalidate({ my: true });
        await invalidate({ my: false });
        options.onSuccess();
      },
    },
  );

  return {
    update,
    ...others,
  };
}

export { useExerciseTemplateUpdate };
