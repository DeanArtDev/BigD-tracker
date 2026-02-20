import { allowIndicationStatusMap, TaskStatus } from '@/entity/planner/tasks';

function isAllowAccentIndicationTask(status: TaskStatus): boolean {
  return allowIndicationStatusMap[status];
}

export { isAllowAccentIndicationTask };
