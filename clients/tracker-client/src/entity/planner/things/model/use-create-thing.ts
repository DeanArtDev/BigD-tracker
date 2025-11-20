import { $privetQueryClient } from '@/shared/api/api-client';

function useCreateThing() {
  const { mutate: createThing, ...states } = $privetQueryClient.useMutation('post', '/things');

  return {
    createThing,
    ...states,
  };
}

export { useCreateThing };
