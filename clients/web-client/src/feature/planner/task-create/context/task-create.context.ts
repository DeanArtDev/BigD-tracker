'use client';

import { GroupId } from '@/entity/planner/groups';
import { createStrictContext, MaybePromise, useStrictContext } from '@/shared/lib';
import { CreateTaskMutation } from '@/shared/transport/graphql';

type SuccessHandler = (data: CreateTaskMutation['createTask']) => MaybePromise<void>;

interface TaskCreateContext {
  readonly openTaskCreate: (params: { readonly groupId?: GroupId; readonly onSuccess?: SuccessHandler }) => void;
}

const taskCreateContext = createStrictContext<TaskCreateContext>();

const useTaskCreateContext = () => useStrictContext<TaskCreateContext>(taskCreateContext);

export { useTaskCreateContext, taskCreateContext, type TaskCreateContext, type SuccessHandler };
