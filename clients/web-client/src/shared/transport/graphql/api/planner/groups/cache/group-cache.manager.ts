import { ApolloCache, ApolloClient } from '@apollo/client';
import { Override } from '@/shared/lib';
import { TaskCacheManager } from '@/shared/transport/graphql';
import type { GroupInfoSchema, GroupSchema, Query, TaskSchema } from '../../../../schema-types';
import { WithReferenceList } from '../../../types';
import { shapeGetGroupListOptions } from '../options';

type GroupTasksCache = WithReferenceList<GroupSchema['tasks'], 'items'>;
type GroupCache = Override<GroupSchema, { tasks: GroupTasksCache }>;

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

  static updateGroupInfo(cache: ApolloCache, input: { groupId: number; name: string }): boolean {
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

  static removeTaskFromGroup(cache: ApolloCache, input: { groupId: number; taskId: string }): boolean {
    const groupCacheId = cache.identify({ __typename: this.#groupTypename, id: input.groupId });
    if (groupCacheId == null) return false;
    const taskCacheId = cache.identify({ __typename: TaskCacheManager.taskTypename, id: input.taskId });
    if (taskCacheId == null) return false;

    return cache.modify<GroupCache>({
      id: groupCacheId,
      fields: {
        taskCount(existed) {
          if (existed == null) return existed;
          return Math.max(0, existed - 1);
        },
        tasks(existingTasks, { isReference, readField, toReference }) {
          if (existingTasks == null || isReference(existingTasks)) return existingTasks;
          const taskRef = toReference(taskCacheId);

          return {
            ...existingTasks,
            items: existingTasks.items.filter((task) => readField('id', task) !== readField('id', taskRef)),
          };
        },
      },
    });
  }

  static removeGroup(cache: ApolloCache, groupId: number): boolean {
    const groupCacheId = cache.identify({ __typename: this.#groupTypename, id: groupId });
    const groupInfoCacheId = cache.identify({ __typename: this.#groupInfoTypename, id: groupId });

    const isGroupRemoved = groupCacheId != null && cache.evict({ id: groupCacheId });
    const isGroupInfoRemoved = groupInfoCacheId != null && cache.evict({ id: groupInfoCacheId });

    return isGroupRemoved || isGroupInfoRemoved;
  }

  static insertTaskAfterTarget(
    cache: ApolloCache,
    {
      targetTaskId,
      clonedTaskId,
      groupId,
    }: { targetTaskId: TaskSchema['id']; clonedTaskId: TaskSchema['id']; groupId: GroupSchema['id'] },
  ): boolean {
    const groupCacheId = cache.identify({ __typename: this.#groupTypename, id: groupId });
    if (groupCacheId == null) return false;
    const clonedTaskCacheId = cache.identify({ __typename: TaskCacheManager.taskTypename, id: clonedTaskId });
    if (clonedTaskCacheId == null) return false;

    return cache.modify<GroupCache>({
      id: groupCacheId,
      fields: {
        taskCount(existed) {
          if (existed == null) return existed;
          return Math.max(0, existed + 1);
        },
        tasks(existingTasks, { isReference, readField, toReference }) {
          if (existingTasks == null || isReference(existingTasks)) return existingTasks;
          const clonedTaskRef = toReference(clonedTaskCacheId);
          if (clonedTaskRef == null) return existingTasks;

          const originalTaskIndex = existingTasks.items.findIndex(
            (taskRef) => readField('id', taskRef) === targetTaskId,
          );
          if (originalTaskIndex < 0) return existingTasks;

          return {
            ...existingTasks,
            items: [
              ...existingTasks.items.slice(0, originalTaskIndex + 1),
              clonedTaskRef,
              ...existingTasks.items.slice(originalTaskIndex + 1),
            ],
          };
        },
      },
    });
  }
}

export { GroupCacheManager };
