import { ApolloCache, ApolloClient } from '@apollo/client';
import { GroupId } from '@/entity/planner/groups';
import type { GroupInfoSchema, GroupSchema, Query } from '@/entity/schema-types';
import { shapeGetGroupListOptions } from '../options';

// TODO: keep it as a example of code
// type GroupTasksCache = WithReferenceList<GroupSchema['tasks'], 'items'>;
// type GroupCacheSchema = Override<GroupSchema, { tasks: GroupTasksCache }>;
// type AssignableGroupsCacheSchema = WithReferenceList<GetAssignableGroupsQuery, 'getAssignableGroups'>;

class GroupCacheManager {
  static readonly #groupTypename: GroupSchema['__typename'] = 'GroupSchema';
  static readonly #groupInfoTypename: GroupInfoSchema['__typename'] = 'GroupInfoSchema';

  static refetchGroup(client: ApolloClient, { groupId }: { groupId?: number }) {
    if (groupId == null) return;

    return client.refetchQueries({
      updateCache: (cache) => {
        const id = cache.identify({ __typename: this.#groupTypename, id: groupId });
        if (id != null) {
          cache.evict({ id });
        }
      },
    });
  }

  static refetchGroupTasks(client: ApolloClient, { groupId }: { groupId?: number }) {
    if (groupId == null) return;

    return client.refetchQueries({
      updateCache: (cache) => {
        const id = cache.identify({ __typename: this.#groupTypename, id: groupId });
        if (id != null) {
          cache.evict({ id, fieldName: 'tasks' });
          cache.evict({ id, fieldName: 'taskCount' });
        }
      },
    });
  }

  static refetchGroupList(client: ApolloClient) {
    const fieldName: keyof Query = 'getGroupList';

    return client.refetchQueries({
      include: [shapeGetGroupListOptions.document],
      updateCache(cache) {
        cache.evict({
          id: 'ROOT_QUERY',
          fieldName,
        });
      },
    });
  }

  static refetchAssignableGroups(client: ApolloClient) {
    const fieldName: keyof Query = 'getAssignableGroups';

    return client.refetchQueries({
      updateCache(cache) {
        cache.evict({
          id: 'ROOT_QUERY',
          fieldName,
        });
      },
    });
  }

  static updateGroupInfo(cache: ApolloCache, input: { groupId: GroupId; name: string }): boolean {
    const groupInfoCacheId = cache.identify({
      __typename: this.#groupInfoTypename,
      id: input.groupId,
    });

    if (groupInfoCacheId == null) return false;

    return cache.modify<GroupInfoSchema>({
      id: groupInfoCacheId,
      fields: {
        name() {
          return input.name;
        },
      },
    });
  }

  static removeGroup(cache: ApolloCache, groupId: GroupId): boolean {
    const groupCacheId = cache.identify({ __typename: this.#groupTypename, id: groupId });
    const groupInfoCacheId = cache.identify({ __typename: this.#groupInfoTypename, id: groupId });

    const isGroupRemoved = groupCacheId != null && cache.evict({ id: groupCacheId });
    const isGroupInfoRemoved = groupInfoCacheId != null && cache.evict({ id: groupInfoCacheId });

    return isGroupRemoved || isGroupInfoRemoved;
  }
}

export { GroupCacheManager };
