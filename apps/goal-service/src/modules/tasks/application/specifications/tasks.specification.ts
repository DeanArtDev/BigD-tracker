import { TasksDB } from '@/modules/tasks/application/ports';
import { TaskStatus } from '@big-d/api-contracts';
import { tasksCombinators } from './init';
import { pgLikeExpr } from './utils';

const { leaf } = tasksCombinators;

const TaskByUserId = (userId: number) =>
  leaf({
    key: 'tasks.byUserId',
    purpose: 'filter',
    toExpr: (eb) => eb('tasks.user_id', '=', userId),
  });

const TaskByGroupId = (groupId: number) =>
  leaf({
    key: 'tasks.byGroupId',
    purpose: 'filter',
    toExpr: (eb) => eb('task_to_group.group_id', '=', groupId),
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

export { TaskByUserId, TaskByGroupId, TaskBySearch, TaskByStatus };
