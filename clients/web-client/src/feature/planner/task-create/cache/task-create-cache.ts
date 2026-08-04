import { ApolloClient } from '@apollo/client';
import { TaskCacheManager } from '@/shared/transport/graphql';

async function invalidateTaskCreateCache(client: ApolloClient) {
  TaskCacheManager.refetchAssignableTasks(client);
  await TaskCacheManager.refetchGetTasksPerPage(client);
}

export { invalidateTaskCreateCache };
