import timeAndDate from '@/shared/lib/time';
import { TaskStatus } from '@/shared/transport/graphql';
import { getTasksStatusCount } from './helpers/get-tasks-status-count';
import { TaskIdParser } from './helpers/taks-id-parser';
import { getTaskFieldsToChangeByStatus } from './helpers/task-fields-to-change-by-status';
import { taskActionByStatusesAvailability } from './maps/task-action-to-status-availability';
import { taskIndicationByStatus, taskIndicationByType } from './maps/task-indication-availability';
import { taskTypeToActionAvailability } from './maps/task-type-to-action-availability';
import { TaskActionType, TaskId, TaskType } from './task';

class TaskDomain {
  static tasksCountByStatus(tasks: { status: TaskStatus }[]) {
    return getTasksStatusCount(tasks);
  }

  static fieldsToChangeByStatus(status: TaskStatus) {
    return getTaskFieldsToChangeByStatus(status);
  }

  static dateToTaskStandard = (date: string | Date): string => {
    return timeAndDate(date).format('YYYY-MM-DDTHH:mm');
  };

  static parseId = (id: TaskId, recurrence?: boolean): { type: TaskType } => {
    const { virtual, origin, override } = TaskIdParser.unwrapId(id) ?? {};
    if (origin != null) {
      if (recurrence != null) return { type: TaskType.OriginalRecurrence };
      return { type: TaskType.Original };
    }
    if (virtual != null) return { type: TaskType.Virtual };
    if (override != null) return { type: TaskType.Override };
    return { type: TaskType.Unknown };
  };

  static isAllowTaskAction(action: TaskActionType, status: TaskStatus, type: TaskType): boolean {
    return (
      taskActionByStatusesAvailability[action].includes(status) && taskTypeToActionAvailability[type].includes(action)
    );
  }

  static isAllowAccentIndicationTask(status: TaskStatus, type: TaskType): boolean {
    return taskIndicationByStatus[status] && taskIndicationByType[type];
  }
}

export { TaskDomain };
