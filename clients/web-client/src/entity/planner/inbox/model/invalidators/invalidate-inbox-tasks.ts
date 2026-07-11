import { ApolloCache, ApolloClient } from '@apollo/client';
import { GroupId } from '@/entity/planner/groups';
import { GetInboxResponse } from '@/entity/schema-types';

async function invalidateInboxTasks(client: ApolloClient, inboxId: GroupId) {
  return client.refetchQueries({
    updateCache(cache: ApolloCache) {
      const __typename: GetInboxResponse['__typename'] = 'GetInboxResponse';
      const inboxCacheId = cache.identify({
        __typename,
        id: inboxId,
      });

      if (inboxCacheId != null) {
        cache.evict({ id: inboxCacheId, fieldName: 'tasks' });
      }
    },
  });
}

export { invalidateInboxTasks };
