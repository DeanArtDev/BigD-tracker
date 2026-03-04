import { tasksCombinators } from './init';

const { leaf } = tasksCombinators;

const TaskOverrideByOccurrenceStartLessOrEqual = (date: Date) =>
  leaf({
    key: 'tasks.overrideByOccurrenceStartLessOrEqual',
    purpose: 'filter',
    toExpr: (eb) => eb('tasks_recurrence_overrides.occurrence_start', '<=', date),
  });

const TaskOverrideByOccurrenceStartGreaterOrEqual = (date: Date) =>
  leaf({
    key: 'tasks.overrideByOccurrenceStartGreaterOrEqual',
    purpose: 'filter',
    toExpr: (eb) => eb('tasks_recurrence_overrides.occurrence_start', '>=', date),
  });

const TaskOverrideByMasterIds = (taskIds: number[]) =>
  leaf({
    key: 'tasks.overridesByMasterIds',
    purpose: 'filter',
    toExpr: (eb) => eb('tasks_recurrence_overrides.task_id', 'in', taskIds),
  });

const TaskOverrideByUserId = (userId: number) =>
  leaf({
    key: 'tasks.overrideByUserId',
    purpose: 'filter',
    toExpr: (eb) => eb('tasks_recurrence_overrides.user_id', '=', userId),
  });

export {
  TaskOverrideByMasterIds,
  TaskOverrideByUserId,
  TaskOverrideByOccurrenceStartGreaterOrEqual,
  TaskOverrideByOccurrenceStartLessOrEqual,
};
