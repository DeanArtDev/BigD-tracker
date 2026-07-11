'use client';

import { GroupId } from '@/entity/planner/groups';
import { createStrictContext, MaybePromise, useStrictContext } from '@/shared/lib';

interface TaskCreateContext {
  readonly openTaskCreate: (params: { groupId?: GroupId; onSuccess?: () => MaybePromise<void> }) => void;
}

const taskCreateContext = createStrictContext<TaskCreateContext>();

const useTaskCreateContext = () => useStrictContext<TaskCreateContext>(taskCreateContext);

export { useTaskCreateContext, taskCreateContext, type TaskCreateContext };
