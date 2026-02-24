import { type GroupEntity, GroupStatus } from './group.entity';

const allowIndicationStatusMap = {
  [GroupStatus.NOT_STARTED]: true,
  [GroupStatus.IN_PROGRESS]: true,
  [GroupStatus.DONE]: false,
};

function isAllowGroupDelete(group: GroupEntity): boolean {
  return group.tasks.length <= 0;
}

export { allowIndicationStatusMap, isAllowGroupDelete };
