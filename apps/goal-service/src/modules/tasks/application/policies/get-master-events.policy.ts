import { TasksDB } from '../ports';
import { TaskByStartDateLessOrEqual, TaskByUserId, TaskHasRecurrence, tasksCombinators } from '../specifications';
import { tagSpec } from '@big-d/api-utils';

const { and } = tasksCombinators;

function GetMasterEventsByRange(input: { userId: number; to: Date; from: Date }) {
  const spec = and(TaskByStartDateLessOrEqual(input.to), TaskByUserId(input.userId), TaskHasRecurrence());

  return tagSpec<TasksDB>(spec, {
    key: 'tasks.policy.get-master-events',
    purpose: 'policy',
  });
}

export { GetMasterEventsByRange };
