import { tagSpec } from '@big-d/api-utils';
import { compact } from 'lodash';
import { TasksDB } from '../ports';
import {
  TaskOverrideByDeadlineGreaterOrEqual,
  TaskOverrideByMasterIds,
  TaskOverrideByStartDateLessOrEqual,
  TaskOverrideByUserId,
  tasksCombinators,
} from '../specifications';

const { and } = tasksCombinators;

function GetTasksOverrides(input: {
  userId: number;
  from: Date;
  to: Date;
  masterEventIds: number[];
}) {
  const spec = and(
    ...compact([
      TaskOverrideByUserId(input.userId),
      input.masterEventIds.length > 0 && TaskOverrideByMasterIds(input.masterEventIds),
      TaskOverrideByStartDateLessOrEqual(input.to),
      TaskOverrideByDeadlineGreaterOrEqual(input.from),
    ]),
  );

  return tagSpec<TasksDB>(spec, {
    key: 'tasks.policy.get-tasks-overrides',
    purpose: 'policy',
  });
}

export { GetTasksOverrides };
