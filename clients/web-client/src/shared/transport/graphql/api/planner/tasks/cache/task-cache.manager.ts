import { ApolloCache, ApolloClient } from '@apollo/client';
import { Override } from '@/shared/lib';
import {
  type GetTasksPerPageQueryVariables,
  type Query,
  shapeGetAssignableTasksOptions,
  shapeGetDiaryTasksOptions,
  shapeGetTasksPerPageOptions,
  TaskStatus,
} from '@/shared/transport/graphql';
import type { TaskSchema, TasksPerPageConnection } from '../../../../schema-types';
import { WithReferenceList } from '../../../types';

type TasksPerPageCache = WithReferenceList<TasksPerPageConnection, 'items'>;
type RootQueryCache = Override<Query, { getTasksPerPage: TasksPerPageCache }>;
type TasksPerPageCacheStorage = Pick<GetTasksPerPageQueryVariables['input'], 'status' | 'recurring'>;

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

  static refetchGetDiaryTasks(client: ApolloClient) {
    const fieldName: keyof Query = 'getDiaryTasks';

    return client.refetchQueries({
      include: [shapeGetDiaryTasksOptions.document],
      updateCache(cache) {
        cache.evict({
          id: 'ROOT_QUERY',
          fieldName,
        });
      },
    });
  }

  static dropGetTasksPerPageByStatuses(client: ApolloClient, statuses: TaskStatus[]) {
    return client.cache.modify<RootQueryCache>({
      id: 'ROOT_QUERY',
      fields: {
        getTasksPerPage(existing, { DELETE, storage }) {
          const { status } = storage as TasksPerPageCacheStorage;
          return status?.every((s) => statuses.includes(s)) ? DELETE : existing;
        },
      },
    });
  }

  static dropGetTasksPerPageByRecurring(client: ApolloClient) {
    return client.cache.modify<RootQueryCache>({
      id: 'ROOT_QUERY',
      fields: {
        getTasksPerPage(existing, { DELETE, storage }) {
          const { recurring } = storage as TasksPerPageCacheStorage;
          return recurring != null ? DELETE : existing;
        },
      },
    });
  }

  static removeTask(cache: ApolloCache, { taskId }: { taskId: string }) {
    const id = cache.identify({ __typename: this.taskTypename, id: taskId });
    if (id != null) cache.evict({ id });
  }

  static insertTaskAfterTargetIntoTasksPerPage(
    cache: ApolloCache,
    {
      targetTaskId,
      clonedTaskId,
    }: {
      targetTaskId: TaskSchema['id'];
      clonedTaskId: TaskSchema['id'];
    },
  ): boolean {
    const clonedTaskCacheId = cache.identify({ __typename: TaskCacheManager.taskTypename, id: clonedTaskId });
    if (clonedTaskCacheId == null) return false;

    return cache.modify<RootQueryCache>({
      id: 'ROOT_QUERY',
      fields: {
        getTasksPerPage(existingTasks, { isReference, readField, toReference }) {
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

export { TaskCacheManager, type TasksPerPageCacheStorage };
