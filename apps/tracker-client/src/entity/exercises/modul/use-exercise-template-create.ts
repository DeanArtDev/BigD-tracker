import { $privetQueryClient } from '@/shared/api/api-client';
import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';
import { useInvalidateExerciseTemplates } from './invalidators';

function useExerciseTemplateCreate() {
  const invalidate = useInvalidateExerciseTemplates();
  const options = getDefaultQueryNotifications();
  const { mutate: create, ...others } = $privetQueryClient.useMutation(
    'post',
    '/exercises/templates',
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
    create,
    ...others,
  };
}

export { useExerciseTemplateCreate };
