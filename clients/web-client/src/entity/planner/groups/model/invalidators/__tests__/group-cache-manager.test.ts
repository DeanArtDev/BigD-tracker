import { gql, InMemoryCache } from '@apollo/client';
import { describe, expect, it } from 'vitest';
import { GroupCacheManager } from '../../cache';
import type { GroupId } from '../../domain/group';

const ASSIGNABLE_GROUPS_QUERY = gql`
  query AssignableGroupsCacheFixture {
    getAssignableGroups {
      id
      name
    }
  }
`;

const GROUP_FRAGMENT = gql`
  fragment GroupCacheFixture on GroupSchema {
    id
    name
  }
`;

const GROUP_ID = 129 as GroupId;

function createCache() {
  const cache = new InMemoryCache();

  cache.writeQuery({
    query: ASSIGNABLE_GROUPS_QUERY,
    data: {
      getAssignableGroups: [{ __typename: 'GroupInfoDto', id: GROUP_ID, name: 'Old name' }],
    },
  });

  cache.writeFragment({
    id: cache.identify({ __typename: 'GroupSchema', id: GROUP_ID }),
    fragment: GROUP_FRAGMENT,
    data: { __typename: 'GroupSchema', id: GROUP_ID, name: 'Old name' },
  });

  return cache;
}

describe('GroupCacheManager', () => {
  it('updates GroupInfoDto name without a request', () => {
    const cache = createCache();

    GroupCacheManager.updateGroupInfo(cache, { groupId: GROUP_ID, name: 'New name' });

    expect(cache.readQuery({ query: ASSIGNABLE_GROUPS_QUERY })).toEqual({
      getAssignableGroups: [{ __typename: 'GroupInfoDto', id: GROUP_ID, name: 'New name' }],
    });
  });

  it('removes GroupSchema and GroupInfoDto from the cache', () => {
    const cache = createCache();
    const groupCacheId = cache.identify({ __typename: 'GroupSchema', id: GROUP_ID });
    const groupInfoCacheId = cache.identify({ __typename: 'GroupInfoDto', id: GROUP_ID });

    GroupCacheManager.removeGroup(cache, GROUP_ID);

    const extractedCache = cache.extract();
    expect(extractedCache[groupCacheId!]).toBeUndefined();
    expect(extractedCache[groupInfoCacheId!]).toBeUndefined();
    expect(cache.readQuery({ query: ASSIGNABLE_GROUPS_QUERY })).toEqual({ getAssignableGroups: [] });
  });
});
