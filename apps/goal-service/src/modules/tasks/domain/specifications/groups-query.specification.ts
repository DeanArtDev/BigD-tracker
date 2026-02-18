import { GroupStatus } from '@big-d/api-contracts';
import { INBOX_GROUP_NAME } from '../constants';

const groupsQuerySpec = {
  inboxName: INBOX_GROUP_NAME,
  unavailableNames: [INBOX_GROUP_NAME],
  unavailableStatuses: [GroupStatus.DONE],
};

export { groupsQuerySpec };
