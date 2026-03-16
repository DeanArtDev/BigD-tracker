import { TaskRecurrenceStatus } from '@big-d/api-contracts';
import { tasksCombinators } from './init';

const { leaf } = tasksCombinators;

const TaskRecurrenceByStartDateLessOrEqual = (date: Date) =>
  leaf({
    key: 'tasks-recurrences.byStartDateLessOrEqual',
    purpose: 'filter',
    toExpr: (eb) => eb('tasks_recurrences.start_date', '<=', date),
  });

const TaskRecurrenceByUserId = (userId: number) =>
  leaf({
    key: 'tasks-recurrences.byUserId',
    purpose: 'filter',
    toExpr: (eb) => eb('tasks_recurrences.user_id', '=', userId),
  });

const TaskRecurrenceById = (id: number) =>
  leaf({
    key: 'tasks-recurrences.byId',
    purpose: 'filter',
    toExpr: (eb) => eb('tasks_recurrences.id', '=', id),
  });

const TaskRecurrenceByTaskId = (taskId: number) =>
  leaf({
    key: 'tasks-recurrences.byTaskId',
    purpose: 'filter',
    toExpr: (eb) => eb('tasks_recurrences.task_id', '=', taskId),
  });

const TaskRecurrenceByStatus = (statuses: TaskRecurrenceStatus[]) =>
  leaf({
    key: 'tasks-recurrences.byTaskId',
    purpose: 'filter',
    toExpr: (eb) => eb('recurrence_statuses.name', 'in', statuses),
  });

const TaskRecurrenceByEmpty = () =>
  leaf({
    key: 'tasks-recurrences.byTaskId',
    purpose: 'filter',
    toExpr: (eb) => eb('recurrence_statuses.name', 'is', null),
  });

export {
  TaskRecurrenceByEmpty,
  TaskRecurrenceByStatus,
  TaskRecurrenceById,
  TaskRecurrenceByUserId,
  TaskRecurrenceByTaskId,
  TaskRecurrenceByStartDateLessOrEqual,
};
