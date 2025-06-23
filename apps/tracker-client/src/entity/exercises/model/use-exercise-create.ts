import { $privetQueryClient } from '@/shared/api/api-client';
import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';

function useExerciseCreate() {
  const options = getDefaultQueryNotifications();
  const { mutate: create, ...others } = $privetQueryClient.useMutation(
    'post',
    '/exercises/repetitions',
    options,
  );

  return {
    create,
    ...others,
  };
}

export { useExerciseCreate };
