import { TasksDB } from '../ports';
import { TaskRecurrenceByStartDateLessOrEqual, TaskRecurrenceByUserId, tasksCombinators } from '../specifications';
import { tagSpec } from '@big-d/api-utils';

const { and } = tasksCombinators;

function GetRecurrencesByRange(input: { userId: number; to: Date; from: Date }) {
  const spec = and(TaskRecurrenceByStartDateLessOrEqual(input.to), TaskRecurrenceByUserId(input.userId));

  return tagSpec<TasksDB>(spec, {
    key: 'tasks.policy.get-recurrences-by-range',
    purpose: 'policy',
  });
}

export { GetRecurrencesByRange };
