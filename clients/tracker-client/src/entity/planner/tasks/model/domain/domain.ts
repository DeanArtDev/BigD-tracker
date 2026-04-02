import dayjs from '@/shared/lib/time';
import { type TaskEntity, TaskStatus, TaskType } from '../task.entity';
import { TaskIdParser } from './taks-id-parser';

enum TaskActionType {
  CLONE = 'CLONE',
  DELETE = 'DELETE',
  DELETE_COMPLETE = 'DELETE_COMPLETE',
  ASSIGN = 'ASSIGN',
  UNASSIGN = 'UNASSIGN',
  FINISH = 'FINISH',
  RECOVER = 'RECOVER',
}

const actionToStatuesMap = {
  [TaskActionType.DELETE]: [
    TaskStatus.NOT_STARTED,
    TaskStatus.IN_PROGRESS,
    TaskStatus.COMPLETED,
    TaskStatus.OVERDUE,
    TaskStatus.CANCELED,
    TaskStatus.ARCHIVED,
  ],

  [TaskActionType.CLONE]: [
    TaskStatus.NOT_STARTED,
    TaskStatus.IN_PROGRESS,
    TaskStatus.COMPLETED,
    TaskStatus.OVERDUE,
    TaskStatus.CANCELED,
    TaskStatus.ARCHIVED,
    TaskStatus.DELETED,
  ],

  [TaskActionType.ASSIGN]: [TaskStatus.NOT_STARTED, TaskStatus.IN_PROGRESS],

  [TaskActionType.UNASSIGN]: [TaskStatus.NOT_STARTED, TaskStatus.IN_PROGRESS],

  [TaskActionType.FINISH]: [TaskStatus.NOT_STARTED, TaskStatus.IN_PROGRESS],

  [TaskActionType.RECOVER]: [TaskStatus.DELETED],

  [TaskActionType.DELETE_COMPLETE]: [TaskStatus.DELETED],
};

const typeToActionMap: Record<TaskType, (keyof typeof TaskActionType)[]> = {
  [TaskType.ORIGINAL]: [
    TaskActionType.CLONE,
    TaskActionType.DELETE,
    TaskActionType.DELETE_COMPLETE,
    TaskActionType.ASSIGN,
    TaskActionType.UNASSIGN,
    TaskActionType.FINISH,
    TaskActionType.RECOVER,
  ],

  [TaskType.ORIGINAL_RECURRENCE]: [TaskActionType.CLONE, TaskActionType.ASSIGN, TaskActionType.UNASSIGN],

  [TaskType.VIRTUAL]: [
    TaskActionType.CLONE,
    TaskActionType.DELETE,
    TaskActionType.ASSIGN,
    TaskActionType.UNASSIGN,
    TaskActionType.FINISH,
  ],

  [TaskType.OVERRIDE]: [
    TaskActionType.CLONE,
    TaskActionType.DELETE,
    TaskActionType.ASSIGN,
    TaskActionType.UNASSIGN,
    TaskActionType.FINISH,
  ],

  [TaskType.UNKNOWN]: [],
};

const allowIndicationStatusMap: Record<TaskStatus, boolean> = {
  [TaskStatus.NOT_STARTED]: true,
  [TaskStatus.IN_PROGRESS]: true,
  [TaskStatus.COMPLETED]: false,
  [TaskStatus.OVERDUE]: false,
  [TaskStatus.CANCELED]: false,
  [TaskStatus.ARCHIVED]: false,
  [TaskStatus.DELETED]: false,
};

const allowIndicationTypeMap: Record<TaskType, boolean> = {
  [TaskType.OVERRIDE]: true,
  [TaskType.VIRTUAL]: true,
  [TaskType.ORIGINAL]: true,
  [TaskType.ORIGINAL_RECURRENCE]: false,
  [TaskType.UNKNOWN]: false,
};

const taskDomainModule = {
  dateToTaskStandard: (date: string): string => {
    return dayjs(date).format('YYYY-MM-DDTHH:mm');
  },

  parseId: (id: string, recurrence?: TaskEntity['recurrence']): { type: TaskType } => {
    const { virtual, origin, override } = TaskIdParser.unwrapId(id) ?? {};
    if (origin != null) {
      if (recurrence != null) return { type: TaskType.ORIGINAL_RECURRENCE };
      return { type: TaskType.ORIGINAL };
    }
    if (virtual != null) return { type: TaskType.VIRTUAL };
    if (override != null) return { type: TaskType.OVERRIDE };
    return { type: TaskType.UNKNOWN };
  },
};

export {
  actionToStatuesMap,
  allowIndicationStatusMap,
  TaskActionType,
  taskDomainModule,
  typeToActionMap,
  allowIndicationTypeMap,
};
