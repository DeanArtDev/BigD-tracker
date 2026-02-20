import { allowIndicationStatusMap, type GroupStatus } from '../../model';

function isAllowAccentIndicationGroup(status: GroupStatus): boolean {
  return allowIndicationStatusMap[status];
}

export { isAllowAccentIndicationGroup };
