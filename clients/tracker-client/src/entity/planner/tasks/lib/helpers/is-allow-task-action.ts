import { TaskType } from '@/entity/planner/tasks';
import { actionToStatuesMap, TaskActionType, TaskStatus, typeToActionMap } from '../../model';

function isAllowTaskAction(
  action: keyof typeof TaskActionType,
  currentStatus: TaskStatus,
  currentType: TaskType,
): boolean {
  return actionToStatuesMap[action].includes(currentStatus) && typeToActionMap[currentType].includes(action);
}

export { isAllowTaskAction };
