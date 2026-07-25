import { ApolloCache, ApolloClient } from '@apollo/client';
import type { Reference } from '@apollo/client/cache';
import { GroupId } from '@/entity/planner/groups';
import { TaskId } from '@/entity/planner/tasks';
import type { GroupInfoDto, GroupSchema, Query } from '@/entity/schema-types';
import { Override } from '@/shared/lib';
import type { GetAssignableGroupsQuery } from '../schemas/groups.schema.generated';

type WithReferenceList<T, K extends keyof T> = Override<T, { [P in K]: Reference[] }>;
type GroupTasksCache = WithReferenceList<GroupSchema['tasks'], 'items'>;
type GroupCacheSchema = Override<GroupSchema, { tasks: GroupTasksCache }>;
type AssignableGroupsCacheSchema = WithReferenceList<GetAssignableGroupsQuery, 'getAssignableGroups'>;

class GroupCacheManager {
  static readonly #groupTypename: GroupSchema['__typename'] = 'GroupSchema';
  static readonly #groupInfoTypename: GroupInfoDto['__typename'] = 'GroupInfoDto';

  static updateGroupInfo(cache: ApolloCache, input: { groupId: GroupId; name: string }): boolean {
    const groupInfoCacheId = cache.identify({
      __typename: this.#groupInfoTypename,
      id: input.groupId,
    });

    if (groupInfoCacheId == null) return false;

    return cache.modify<GroupInfoDto>({
      id: groupInfoCacheId,
      fields: {
        name() {
          return input.name;
        },
      },
    });
  }

  static removeGroupInfo(cache: ApolloCache, groupId: GroupId): boolean {
    return cache.modify<AssignableGroupsCacheSchema>({
      id: 'ROOT_QUERY',
      fields: {
        getAssignableGroups(existingGroupReferences = [], { readField }) {
          return existingGroupReferences.filter((groupReference) => readField('id', groupReference) !== groupId);
        },
      },
    });
  }

  static removeGroup(cache: ApolloCache, groupId: GroupId): boolean {
    const groupCacheId = cache.identify({ __typename: this.#groupTypename, id: groupId });
    const groupInfoCacheId = cache.identify({ __typename: this.#groupInfoTypename, id: groupId });

    const isGroupInfoListModified = this.removeGroupInfo(cache, groupId);
    const isGroupRemoved = groupCacheId != null && cache.evict({ id: groupCacheId });
    const isGroupInfoRemoved = groupInfoCacheId != null && cache.evict({ id: groupInfoCacheId });

    return isGroupInfoListModified || isGroupRemoved || isGroupInfoRemoved;
  }

  static removeGroupTask(cache: ApolloCache, input: { groupId: GroupId; taskId: TaskId }): boolean {
    const { taskId, groupId } = input;
    const groupCacheId = cache.identify({ __typename: this.#groupTypename, id: groupId });
    if (groupCacheId == null) return false;

    return cache.modify<GroupCacheSchema>({
      id: groupCacheId,
      fields: {
        tasks(existingTasks, { readField, isReference }) {
          if (existingTasks == null || isReference(existingTasks)) return existingTasks;

          return {
            ...existingTasks,
            items: existingTasks.items.filter((taskReference: Reference) => readField('id', taskReference) !== taskId),
          };
        },
      },
    });
  }

  static changeGroupTaskCount(
    cache: ApolloCache,
    input: {
      groupId: GroupId;
      delta: number;
    },
  ): boolean {
    const groupCacheId = cache.identify({ __typename: this.#groupTypename, id: input.groupId });
    if (groupCacheId == null) return false;

    return cache.modify<GroupCacheSchema>({
      id: groupCacheId,
      fields: {
        taskCount(existingTaskCount) {
          if (existingTaskCount == null) {
            return existingTaskCount;
          }

          return Math.max(0, existingTaskCount + input.delta);
        },
      },
    });
  }

  static invalidateAssignableTasks(client: ApolloClient) {
    const fieldName: keyof Query = 'getAssignableTasks';

    return client.refetchQueries({
      updateCache(cache) {
        cache.evict({
          id: 'ROOT_QUERY',
          fieldName,
        });
      },
    });
  }
}

export { GroupCacheManager };
