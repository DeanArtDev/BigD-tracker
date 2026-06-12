import { ApolloCache, ApolloClient } from '@apollo/client';

async function invalidateInboxTasks(client: ApolloClient, inboxId: number) {
  return client.refetchQueries({
    include: ['GetInbox'],

    updateCache(cache: ApolloCache) {
      const inboxCacheId = cache.identify({
        __typename: 'GetInboxResponse',
        id: inboxId,
      });

      if (!inboxCacheId) {
        return;
      }

      cache.evict({
        id: inboxCacheId,
        fieldName: 'tasks',
      });

      cache.gc();
    },
  });
}

export { invalidateInboxTasks };
