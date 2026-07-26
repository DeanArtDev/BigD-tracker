import { ApolloCache, ApolloClient } from '@apollo/client';
import { Override } from '@/shared/lib';
import { TaskCacheManager } from '@/shared/transport/graphql';
import { GetInboxResponse, type TaskSchema } from '../../../../schema-types';
import { WithReferenceList } from '../../../types';
import { shapeGetPlannerInitOptions } from '../../planner-init';

type InboxGroupTasksCache = WithReferenceList<GetInboxResponse['tasks'], 'items'>;
type GroupInboxCacheCache = Override<GetInboxResponse, { tasks: InboxGroupTasksCache }>;

class InboxGroupCacheManager {
  static readonly #inboxTypename: GetInboxResponse['__typename'] = 'GetInboxResponse';

  static async refetch(client: ApolloClient, params?: { inboxId?: number }) {
    return await client.refetchQueries({
      updateCache: (cache) => {
        const plannerInit = client.cache.readQuery({ query: shapeGetPlannerInitOptions.document });

        const inboxCacheId = cache.identify({
          __typename: this.#inboxTypename,
          id: params?.inboxId ?? plannerInit?.getPlannerInit.inboxId,
        });

        if (inboxCacheId) {
          cache.evict({ id: inboxCacheId });
          cache.gc();
        }
      },
    });
  }

  static insertTaskAfterTarget(
    cache: ApolloCache,
    { targetTaskId, clonedTaskId }: { targetTaskId: TaskSchema['id']; clonedTaskId: TaskSchema['id'] },
  ): boolean {
    const plannerInit = cache.readQuery({ query: shapeGetPlannerInitOptions.document });

    const inboxCacheId = cache.identify({ __typename: this.#inboxTypename, id: plannerInit?.getPlannerInit.inboxId });
    if (inboxCacheId == null) return false;
    const clonedTaskCacheId = cache.identify({ __typename: TaskCacheManager.taskTypename, id: clonedTaskId });
    if (clonedTaskCacheId == null) return false;

    return cache.modify<GroupInboxCacheCache>({
      id: inboxCacheId,
      fields: {
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

export { InboxGroupCacheManager };
