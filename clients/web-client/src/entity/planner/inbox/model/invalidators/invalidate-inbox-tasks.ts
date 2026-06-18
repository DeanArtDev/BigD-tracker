import { ApolloCache, ApolloClient } from '@apollo/client';
import { GetInboxResponse } from '@/entity/schema-types';

async function invalidateInboxTasks(client: ApolloClient, inboxId: number) {
  return client.refetchQueries({
    include: ['GetInbox'],

    updateCache(cache: ApolloCache) {
      const __typename: GetInboxResponse['__typename'] = 'GetInboxResponse';
      const inboxCacheId = cache.identify({
        __typename,
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
