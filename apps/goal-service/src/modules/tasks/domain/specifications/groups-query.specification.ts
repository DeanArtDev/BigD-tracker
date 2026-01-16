import { INBOX_GROUP_KEY } from '@/modules/tasks/application/ports';
import { GroupStatus } from '@big-d/api-contracts';

const groupsQuerySpec = {
  unavailableNames: [INBOX_GROUP_KEY],
  unavailableStatuses: [GroupStatus.DONE],
};

export { groupsQuerySpec };
