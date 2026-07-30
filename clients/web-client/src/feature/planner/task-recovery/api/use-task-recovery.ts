import { useMutation } from '@apollo/client/react';
import { useCallback, useState } from 'react';
import { GroupId } from '@/entity/planner/groups';
import { TaskId } from '@/entity/planner/tasks';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import {
  GroupCacheManager,
  InboxGroupCacheManager,
  PlannerInitCacheManager,
  shapeTaskRecoveryOptions,
  TaskCacheManager,
  useExtendApolloErrorResult,
} from '@/shared/transport/graphql';

function useTaskRecovery() {
  const [recoveryTask, rest] = useMutation(...shapeTaskRecoveryOptions({ awaitRefetchQueries: true }));
  const { appErrors } = useExtendApolloErrorResult(rest.error);

  const [loading, setLoading] = useState(false);

  useExceptionNotificator({
    exception: appErrors.at(-1),
    messageHandlers: { anyException: () => 'Восстановление не удалось, попробуйте снова' },
  });

  const taskRecoveryHandle = useCallback(
    async ({ taskId, groupId }: { taskId: TaskId; groupId: GroupId }) => {
      if (loading) return;

      try {
        setLoading(true);
        const response = await recoveryTask({ variables: { input: { id: taskId, groupId } } });
        if (response?.data != null) {
          const { groupId } = response.data.taskRecovery;

          TaskCacheManager.refetchAssignableTasks(rest.client);
          GroupCacheManager.refetchGroupTasks(rest.client, { groupId: groupId ?? undefined });
          PlannerInitCacheManager.refetch(rest.client);
          InboxGroupCacheManager.refetch(rest.client, { inboxId: groupId ?? undefined });

          await TaskCacheManager.refetchGetTasksPerPage(rest.client);
          rest.client.cache.gc();
        }
      } finally {
        setLoading(false);
      }
    },
    [loading, rest.client, recoveryTask],
  );

  return { recoveryTask: taskRecoveryHandle, ...rest, loading: rest.loading || loading };
}

export { useTaskRecovery };
