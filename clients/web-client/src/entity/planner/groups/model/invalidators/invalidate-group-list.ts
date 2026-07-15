import { ApolloClient } from '@apollo/client';

async function invalidateGroupList(client: ApolloClient) {
  return client.refetchQueries({
    include: ['GetGroupList'],

    updateCache(cache) {
      cache.evict({
        id: 'ROOT_QUERY',
        fieldName: 'getGroupList',
      });

      cache.gc();
    },
  });
}

export { invalidateGroupList };
