import { actionToStatuesMap, TaskActionType, TaskStatus } from '../../model';

function isAllowTaskAction(
  action: keyof typeof TaskActionType,
  currentStatus: TaskStatus,
): boolean {
  return actionToStatuesMap[action].includes(currentStatus);
}

export { isAllowTaskAction };
