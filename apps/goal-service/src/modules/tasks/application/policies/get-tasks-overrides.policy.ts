import { tagSpec } from '@big-d/api-utils';
import { compact } from 'lodash';
import { TasksDB } from '../ports';
import { TaskOverrideByRecurrencesIds, TaskOverrideByUserId, tasksCombinators } from '../specifications';

const { and, leaf } = tasksCombinators;

function GetTasksOverrides(input: { userId: number; from: Date; to: Date; recurrenceIds: number[] }) {
  const spec = and(
    and(
      ...compact([
        TaskOverrideByUserId(input.userId),
        input.recurrenceIds.length > 0 && TaskOverrideByRecurrencesIds(input.recurrenceIds),
        leaf({
          key: 'tasks.overrideByStartDateInRange',
          purpose: 'filter',
          toExpr: (eb) =>
            eb.and([
              eb('tasks_recurrences_overrides.start_date', '<=', input.to),
              eb('tasks_recurrences_overrides.deadline', '>=', input.from),
            ]),
        }),
      ]),
    ),
  );

  return tagSpec<TasksDB>(spec, {
    key: 'tasks.policy.get-tasks-overrides',
    purpose: 'policy',
  });
}

export { GetTasksOverrides };
