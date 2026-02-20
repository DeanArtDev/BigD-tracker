import { GroupStatus } from './group.entity';

const allowIndicationStatusMap = {
  [GroupStatus.NOT_STARTED]: true,
  [GroupStatus.IN_PROGRESS]: true,
  [GroupStatus.DONE]: false,
};

export { allowIndicationStatusMap };
