import { timeAndDate } from '@big-d/time';
import { Brand } from '@/shared/lib';
import { TaskPriority, TaskStatus } from '@/shared/transport/graphql';
import { getTasksStatusCount } from './helpers/get-tasks-status-count';
import { TaskIdParser } from './helpers/taks-id-parser';
import { getTaskFieldsToChangeByStatus } from './helpers/task-fields-to-change-by-status';
import { taskActionByStatusesAvailability } from './maps/task-action-to-status-availability';
import { taskIndicationByStatus, taskIndicationByType } from './maps/task-indication-availability';
import { taskTypeToActionAvailability } from './maps/task-type-to-action-availability';
import { Task, TaskActionType, TaskId, TaskType } from './task';

type ParsedTaskId =
  | {
      readonly type: TaskType.Original | TaskType.OriginalRecurrence;
      readonly data: { id: number };
    }
  | {
      readonly type: TaskType.Virtual;
      readonly data: { recurrenceId: number; date: string };
    }
  | {
      readonly type: TaskType.Override;
      readonly data: { recurrenceId: number; overrideId: number; date: string };
    }
  | {
      readonly type: TaskType.Unknown;
      readonly data: null;
    };

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

  static parseId = (id: TaskId, recurrence = false): ParsedTaskId => {
    const { virtual, origin, override } = TaskIdParser.unwrapId(id) ?? {};
    if (origin != null) {
      if (recurrence) return { type: TaskType.OriginalRecurrence, data: origin };
      return { type: TaskType.Original, data: origin };
    }
    if (virtual != null) return { type: TaskType.Virtual, data: virtual };
    if (override != null) return { type: TaskType.Override, data: override };
    return { type: TaskType.Unknown, data: null };
  };

  static isAllowTaskAction(action: TaskActionType, status: TaskStatus, type: TaskType): boolean {
    return (
      taskActionByStatusesAvailability[action].includes(status) && taskTypeToActionAvailability[type].includes(action)
    );
  }

  static isAllowAccentIndicationTask(status: TaskStatus, type: TaskType): boolean {
    return taskIndicationByStatus[status] && taskIndicationByType[type];
  }

  static isRecurrent = <BrandGroup extends Brand<number, string>>(
    task: Pick<Task<BrandGroup>, 'id' | 'recurrence'>,
  ) => {
    return this.parseId(task.id, task.recurrence != null).type === TaskType.OriginalRecurrence;
  };

  static defaultFields = {
    status: TaskStatus.NotStarted,
    priority: TaskPriority.Delete,
  } as const;
}

export { TaskDomain, type ParsedTaskId };
