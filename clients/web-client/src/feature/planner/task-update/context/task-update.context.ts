'use client';

import { GroupId } from '@/entity/planner/groups';
import { Task } from '@/entity/planner/tasks';
import { createStrictContext, useStrictContext } from '@/shared/lib';

interface TaskUpdateContext {
  readonly openTaskUpdate: (task: Task<GroupId>) => void;
}

const taskUpdateContext = createStrictContext<TaskUpdateContext>();

const useTaskUpdateContext = () => useStrictContext<TaskUpdateContext>(taskUpdateContext);

export { useTaskUpdateContext, taskUpdateContext, type TaskUpdateContext };
