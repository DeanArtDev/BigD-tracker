import { ApolloClient } from '@apollo/client';
import { shapeGetPlannerInitOptions } from '@/shared/transport/graphql';

async function invalidateInboxTasks(client: ApolloClient) {
  return await client.refetchQueries({
    updateCache(cache) {
      const plannerInit = client.cache.readQuery({ query: shapeGetPlannerInitOptions.document });

      const inboxCacheId = cache.identify({
        __typename: 'GetInboxResponse',
        id: plannerInit?.getPlannerInit.inboxId,
      });

      if (!inboxCacheId) {
        return;
      }

      cache.evict({
        id: inboxCacheId,
        fieldName: 'tasks',
      });
    },
  });
}

export { invalidateInboxTasks };
