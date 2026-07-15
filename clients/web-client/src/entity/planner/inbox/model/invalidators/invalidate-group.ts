import { ApolloCache } from '@apollo/client';
import { GroupId } from '@/entity/planner/groups';
import { GroupSchema } from '@/entity/schema-types';

async function invalidateGroup(cache: ApolloCache, groupId: GroupId) {
  const __typename: GroupSchema['__typename'] = 'GroupSchema';
  const groupCacheId = cache.identify({
    __typename,
    id: groupId,
  });

  if (groupCacheId != null) {
    cache.evict({ id: groupCacheId });
  }
}

export { invalidateGroup };
