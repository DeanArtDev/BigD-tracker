import { $privetQueryClient } from '@/shared/api/api-client';

function useCreateTask() {
  const { mutate: createTask, ...states } = $privetQueryClient.useMutation('post', '/tasks');

  return {
    createTask,
    ...states,
  };
}

export { useCreateTask };
