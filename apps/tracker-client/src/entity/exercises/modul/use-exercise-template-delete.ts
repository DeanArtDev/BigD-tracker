import { $privetQueryClient } from '@/shared/api/api-client';
import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';
import { useInvalidateExerciseTemplates } from './invalidators';

function useExerciseTemplateDelete() {
  const invalidate = useInvalidateExerciseTemplates();
  const options = getDefaultQueryNotifications();
  const { mutate: deleteTrigger, ...others } = $privetQueryClient.useMutation(
    'delete',
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
    deleteTrigger,
    ...others,
  };
}

export { useExerciseTemplateDelete };
