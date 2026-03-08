import { tagSpec } from '@big-d/api-utils';
import { compact } from 'lodash';
import { TasksDB } from '../ports';
import {
  TaskOverrideByRecurrencesIds,
  TaskOverrideByStartGreaterOrEqual,
  TaskOverrideByStartLessOrEqual,
  TaskOverrideByUserId,
  tasksCombinators,
} from '../specifications';

const { and } = tasksCombinators;

function GetTasksOverrides(input: { userId: number; from: Date; to: Date; recurrenceIds: number[] }) {
  const spec = and(
    ...compact([
      TaskOverrideByUserId(input.userId),
      input.recurrenceIds.length > 0 && TaskOverrideByRecurrencesIds(input.recurrenceIds),
      TaskOverrideByStartLessOrEqual(input.to),
      TaskOverrideByStartGreaterOrEqual(input.from),
    ]),
  );

  return tagSpec<TasksDB>(spec, {
    key: 'tasks.policy.get-tasks-overrides',
    purpose: 'policy',
  });
}

export { GetTasksOverrides };
