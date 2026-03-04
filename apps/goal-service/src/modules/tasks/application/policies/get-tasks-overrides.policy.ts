import { tagSpec } from '@big-d/api-utils';
import { compact } from 'lodash';
import { TasksDB } from '../ports';
import {
  TaskOverrideByMasterIds,
  TaskOverrideByOccurrenceStartGreaterOrEqual,
  TaskOverrideByOccurrenceStartLessOrEqual,
  TaskOverrideByUserId,
  tasksCombinators,
} from '../specifications';

const { and } = tasksCombinators;

function GetTasksOverrides(input: { userId: number; from: Date; to: Date; masterEventIds: number[] }) {
  const spec = and(
    ...compact([
      TaskOverrideByUserId(input.userId),
      input.masterEventIds.length > 0 && TaskOverrideByMasterIds(input.masterEventIds),
      TaskOverrideByOccurrenceStartLessOrEqual(input.to),
      TaskOverrideByOccurrenceStartGreaterOrEqual(input.from),
    ]),
  );

  return tagSpec<TasksDB>(spec, {
    key: 'tasks.policy.get-tasks-overrides',
    purpose: 'policy',
  });
}

export { GetTasksOverrides };
