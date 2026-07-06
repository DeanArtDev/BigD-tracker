'use client';

import { Task } from '@/entity/planner/tasks';
import { createStrictContext, useStrictContext } from '@/shared/lib';

interface TaskUpdateContext {
  readonly openTaskUpdate: (task: Task) => void;
}

const taskUpdateContext = createStrictContext<TaskUpdateContext>();

const useTaskUpdateContext = () => useStrictContext<TaskUpdateContext>(taskUpdateContext);

export { useTaskUpdateContext, taskUpdateContext, type TaskUpdateContext };
