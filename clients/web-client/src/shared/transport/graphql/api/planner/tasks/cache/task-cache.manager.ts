import { ApolloCache, ApolloClient } from '@apollo/client';
import { type Query, shapeGetAssignableTasksOptions } from '@/shared/transport/graphql';
import type { GetInboxResponse, GroupSchema, TaskSchema, TasksConnection } from '../../../../schema-types';
import type { WithReferenceList } from '../../../types';

type TasksConnectionCache = WithReferenceList<TasksConnection, 'items'>;
type TaskListOwnerCache = { tasks: TasksConnectionCache };

class TaskCacheManager {
  static readonly taskTypename: TaskSchema['__typename'] = 'TaskSchema';
  static readonly #groupTypename: GroupSchema['__typename'] = 'GroupSchema';
  static readonly #inboxTypename: GetInboxResponse['__typename'] = 'GetInboxResponse';

  static insertClonedTaskAfterOriginal(
    cache: ApolloCache,
    { originalTaskId, clonedTask }: { originalTaskId: TaskSchema['id']; clonedTask: TaskSchema },
  ): boolean {
    if (clonedTask.groupId == null) return false;

    const ownerCacheIds = new Set([
      cache.identify({ __typename: this.#groupTypename, id: clonedTask.groupId }),
      cache.identify({ __typename: this.#inboxTypename, id: clonedTask.groupId }),
    ]);

    let isInserted = false;

    for (const ownerCacheId of ownerCacheIds) {
      if (ownerCacheId == null) continue;

      cache.modify<TaskListOwnerCache>({
        id: ownerCacheId,
        fields: {
          tasks(existingTasks, { isReference, readField, toReference }) {
            if (existingTasks == null || isReference(existingTasks)) return existingTasks;

            const hasClone = existingTasks.items.some((taskRef) => readField('id', taskRef) === clonedTask.id);
            if (hasClone) return existingTasks;

            const originalTaskIndex = existingTasks.items.findIndex(
              (taskRef) => readField('id', taskRef) === originalTaskId,
            );
            if (originalTaskIndex < 0) return existingTasks;

            const clonedTaskRef = toReference({ __typename: TaskCacheManager.taskTypename, ...clonedTask }, true);
            if (clonedTaskRef == null) return existingTasks;

            isInserted = true;

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

    return isInserted;
  }

  static refetchTask(client: ApolloClient, { taskId }: { taskId: string }) {
    return client.refetchQueries({
      updateCache: (cache) => {
        const id = cache.identify({ __typename: this.taskTypename, id: taskId });
        if (id != null) {
          cache.evict({ id });
        }
      },
    });
  }

  static refetchAssignableTasks(client: ApolloClient) {
    const fieldName: keyof Query = 'getAssignableTasks';

    return client.refetchQueries({
      include: [shapeGetAssignableTasksOptions.document],
      updateCache(cache) {
        cache.evict({
          id: 'ROOT_QUERY',
          fieldName,
        });
      },
    });
  }

  static removeTask(cache: ApolloCache, { taskId }: { taskId: string }) {
    const id = cache.identify({ __typename: this.taskTypename, id: taskId });
    if (id != null) cache.evict({ id });
  }
}

export { TaskCacheManager };
