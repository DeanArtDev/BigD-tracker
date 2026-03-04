import { TasksDB } from '@/modules/tasks/application/ports';
import { TaskStatus } from '@big-d/api-contracts';
import { tasksCombinators } from './init';
import { pgLikeExpr } from './utils';

const { leaf } = tasksCombinators;

const TaskByStartDateLessOrEqual = (date: Date) =>
  leaf({
    key: 'tasks.byStartDateLessOrEqual',
    purpose: 'filter',
    toExpr: (eb) => eb('tasks.start_date', '<=', date),
  });

const TaskByDeadlineGreaterOrEqual = (date: Date) =>
  leaf({
    key: 'tasks.byDeadlineGreaterOrEqual',
    purpose: 'filter',
    toExpr: (eb) => eb('tasks.deadline', '>=', date),
  });

const TaskByUserId = (userId: number) =>
  leaf({
    key: 'tasks.byUserId',
    purpose: 'filter',
    toExpr: (eb) => eb('tasks.user_id', '=', userId),
  });

const TaskById = (taskId: number) =>
  leaf({
    key: 'tasks.byId',
    purpose: 'filter',
    toExpr: (eb) => eb('tasks.id', '=', taskId),
  });

const TaskByGroupId = (groupIds: number[]) =>
  leaf({
    key: 'tasks.byGroupId',
    purpose: 'filter',
    toExpr: (eb) => eb('task_to_group.group_id', 'in', groupIds),
  });

const TaskByPriority = (priority: number[]) =>
  leaf({
    key: 'tasks.byPriority',
    purpose: 'filter',
    toExpr: (eb) => eb('tasks.priority', 'in', priority),
  });

const TaskInGroup = () =>
  leaf({
    key: 'tasks.inGroup',
    purpose: 'filter',
    toExpr: (eb) => eb('task_to_group.group_id', 'is not', null),
  });

const TaskByStatus = (statuses: TaskStatus[]) =>
  leaf({
    key: 'tasks.byStatus',
    purpose: 'filter',
    toExpr: (eb) => eb('task_statuses.name', 'in', statuses),
  });

const TaskBySearch = (search: string) =>
  leaf({
    key: 'tasks.bySearch',
    purpose: 'filter',
    toExpr: () =>
      pgLikeExpr<TasksDB, 'tasks', 'name'>({
        table: 'tasks',
        column: 'name',
        value: search,
        mode: 'contains',
        caseInsensitive: true,
      }),
  });

const TaskHasRecurrence = () =>
  leaf({
    key: 'tasks.hasRecurrence',
    purpose: 'filter',
    toExpr: (eb) => eb('tasks.recurrence', 'is not', null),
  });

export {
  TaskById,
  TaskByUserId,
  TaskByGroupId,
  TaskByPriority,
  TaskBySearch,
  TaskByStatus,
  TaskInGroup,
  TaskByStartDateLessOrEqual,
  TaskByDeadlineGreaterOrEqual,
  TaskHasRecurrence,
};
