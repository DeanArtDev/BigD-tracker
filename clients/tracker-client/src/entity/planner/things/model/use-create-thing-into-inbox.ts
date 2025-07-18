import { $privetQueryClient } from '@/shared/api/api-client';

function useCreateThingIntoInbox() {
  const { mutate: createThing, ...states } = $privetQueryClient.useMutation(
    'post',
    '/things/inbox',
  );

  return {
    createThing,
    ...states,
  };
}

export { useCreateThingIntoInbox };
