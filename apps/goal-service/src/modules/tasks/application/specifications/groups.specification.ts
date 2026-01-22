import { groupsQuerySpec } from '@/modules/tasks/domain';
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

export { GroupById, GroupInbox, GroupByUserId };
