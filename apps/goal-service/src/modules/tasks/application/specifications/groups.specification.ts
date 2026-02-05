import { TasksDB } from '@/modules/tasks/application/ports';
import { pgLikeExpr } from '@/modules/tasks/application/specifications/utils';
import { groupsQuerySpec } from '@/modules/tasks/domain';
import { GroupStatus } from '@big-d/api-contracts';
import { groupsCombinators } from './init';

const { leaf } = groupsCombinators;

const GroupByUserId = (userId: number) =>
  leaf({
    key: 'groups.byUserId',
    purpose: 'filter',
    toExpr: (eb) => eb('groups.user_id', '=', userId),
  });

const GroupById = (groupId: number) =>
  leaf({
    key: 'groups.byId',
    purpose: 'filter',
    toExpr: (eb) => eb('groups.id', '=', groupId),
  });

const GroupInbox = () =>
  leaf({
    key: 'groups.inbox',
    purpose: 'filter',
    toExpr: (eb) => eb('groups.name', '=', groupsQuerySpec.inboxName),
  });

const GroupAfterId = (groupId: number) =>
  leaf({
    key: 'groups.afterId',
    purpose: 'filter',
    toExpr: (eb) => eb('groups.id', '>', groupId),
  });

const GroupByStatus = (statuses: GroupStatus[]) =>
  leaf({
    key: 'groups.byStatus',
    purpose: 'filter',
    toExpr: (eb) => eb('group_statuses.name', 'in', statuses),
  });

const GroupBySearch = (search: string) =>
  leaf({
    key: 'tasks.bySearch',
    purpose: 'filter',
    toExpr: () =>
      pgLikeExpr<TasksDB, 'groups', 'name'>({
        table: 'groups',
        column: 'name',
        value: search,
        mode: 'contains',
        caseInsensitive: true,
      }),
  });

export { GroupById, GroupInbox, GroupByUserId, GroupBySearch, GroupAfterId, GroupByStatus };
