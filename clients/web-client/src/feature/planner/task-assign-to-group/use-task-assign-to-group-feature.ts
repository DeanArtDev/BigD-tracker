import { useCallback, useState } from 'react';
import { GroupId } from '@/entity/planner/groups';
import { TaskId } from '@/entity/planner/tasks';
import { MaybePromise } from '@/shared/lib';
import { useNotify } from '@/shared/project-ui';
import {
  GroupCacheManager,
  InboxGroupCacheManager,
  PlannerInitCacheManager,
  TaskCacheManager,
} from '@/shared/transport/graphql';
import { useTaskAssign } from './api/use-task-assign';

type AssignTaskHandlerParams = {
  readonly task: {
    readonly groupId?: GroupId;
    readonly id: TaskId;
  };
  readonly groupId: GroupId;
};

function useTaskAssignToGroupFeature() {
  const { promise } = useNotify();

  const { assignTask, client, ...rest } = useTaskAssign();
  const [loading, setLoading] = useState(false);

  const assignToGroup = useCallback(
    async (
      { groupId, task }: AssignTaskHandlerParams,
      params?: { onSuccess?: (data: AssignTaskHandlerParams) => MaybePromise<void>; showToast?: boolean },
    ) => {
      const { showToast = true, onSuccess } = params ?? {};

      const mutation = async () => {
        setLoading(true);
        const response = await assignTask({
          variables: { input: { groupId, taskId: task.id } },
          awaitRefetchQueries: true,
        });

        if (response?.data != null) {
          PlannerInitCacheManager.refetch(client);

          InboxGroupCacheManager.refetch(client, { inboxId: task?.groupId });

          GroupCacheManager.refetchGroupTasks(client, { groupId });
          GroupCacheManager.refetchGroupTasks(client, { groupId: task?.groupId });

          TaskCacheManager.refetchAssignableTasks(client);
          TaskCacheManager.dropCurrentGetTasksPerPage(client);
          await onSuccess?.({ groupId, task });
        }
        setLoading(false);
      };

      const ranMutation = mutation();
      if (showToast) promise(ranMutation);
      return ranMutation;
    },
    [assignTask, client, promise],
  );

  return {
    assignToGroup,
    client,
    ...rest,
    loading: loading || rest.loading,
  };
}

export { useTaskAssignToGroupFeature, type AssignTaskHandlerParams };
