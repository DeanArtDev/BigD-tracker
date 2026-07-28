import { ApolloCache, ApolloClient } from '@apollo/client';
import { type Query, shapeGetAssignableTasksOptions, shapeGetTasksPerPageOptions } from '@/shared/transport/graphql';
import type { TaskSchema } from '../../../../schema-types';

class TaskCacheManager {
  static readonly taskTypename: TaskSchema['__typename'] = 'TaskSchema';

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

  static refetchGetTasksPerPage(client: ApolloClient) {
    const fieldName: keyof Query = 'getTasksPerPage';

    return client.refetchQueries({
      include: [shapeGetTasksPerPageOptions.document],
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
