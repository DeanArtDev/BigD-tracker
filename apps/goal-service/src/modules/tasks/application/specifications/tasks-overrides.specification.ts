import { tasksCombinators } from './init';

const { leaf } = tasksCombinators;

const TaskOverrideByStartLessOrEqual = (date: Date) =>
  leaf({
    key: 'tasks.overrideByStartLessOrEqual',
    purpose: 'filter',
    toExpr: (eb) => eb('tasks_recurrences_overrides.recurrence_start', '<=', date),
  });

const TaskOverrideByStartGreaterOrEqual = (date: Date) =>
  leaf({
    key: 'tasks.overrideByStartGreaterOrEqual',
    purpose: 'filter',
    toExpr: (eb) => eb('tasks_recurrences_overrides.recurrence_start', '>=', date),
  });

const TaskOverrideByRecurrencesIds = (ids: number[]) =>
  leaf({
    key: 'tasks.overridesByMasterIds',
    purpose: 'filter',
    toExpr: (eb) => eb('tasks_recurrences_overrides.recurrence_id', 'in', ids),
  });

const TaskOverrideByUserId = (userId: number) =>
  leaf({
    key: 'tasks.overrideByUserId',
    purpose: 'filter',
    toExpr: (eb) => eb('tasks_recurrences_overrides.user_id', '=', userId),
  });

const TaskOverrideById = (id: number) =>
  leaf({
    key: 'tasks.overrideById',
    purpose: 'filter',
    toExpr: (eb) => eb('tasks_recurrences_overrides.id', '=', id),
  });

export {
  TaskOverrideByRecurrencesIds,
  TaskOverrideByUserId,
  TaskOverrideByStartGreaterOrEqual,
  TaskOverrideByStartLessOrEqual,
  TaskOverrideById,
};
