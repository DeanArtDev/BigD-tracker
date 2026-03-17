import { allowIndicationStatusMap, allowIndicationTypeMap, TaskStatus, TaskType } from '../../model';

function isAllowAccentIndicationTask(status: TaskStatus, type: TaskType): boolean {
  return allowIndicationStatusMap[status] && allowIndicationTypeMap[type];
}

export { isAllowAccentIndicationTask };
