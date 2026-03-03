import { tasksCombinators } from './init';

const { leaf } = tasksCombinators;

const TaskOverrideByStartDateLessOrEqual = (date: Date) =>
  leaf({
    key: 'tasks.overridesByStartDateLessOrEqual',
    purpose: 'filter',
    toExpr: (eb) => eb('tasks_recurrence_overrides.start_date', '<=', date),
  });

const TaskOverrideByDeadlineGreaterOrEqual = (date: Date) =>
  leaf({
    key: 'tasks.overridesByDeadlineGreaterOrEqual',
    purpose: 'filter',
    toExpr: (eb) => eb('tasks_recurrence_overrides.deadline', '>=', date),
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
  TaskOverrideByStartDateLessOrEqual,
  TaskOverrideByDeadlineGreaterOrEqual,
};
