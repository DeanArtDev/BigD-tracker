import { TaskActionType, TaskType } from '../task.entity';

const taskTypeToActionAvailability: Record<TaskType, TaskActionType[]> = {
  [TaskType.Original]: [
    TaskActionType.Clone,
    TaskActionType.Delete,
    TaskActionType.DeleteComplete,
    TaskActionType.Assign,
    TaskActionType.Unassign,
    TaskActionType.Finish,
    TaskActionType.Recover,
  ],

  [TaskType.OriginalRecurrence]: [TaskActionType.Clone, TaskActionType.Assign, TaskActionType.Unassign],

  [TaskType.Virtual]: [
    TaskActionType.Clone,
    TaskActionType.Delete,
    TaskActionType.Assign,
    TaskActionType.Unassign,
    TaskActionType.Finish,
  ],

  [TaskType.Override]: [
    TaskActionType.Clone,
    TaskActionType.Delete,
    TaskActionType.Assign,
    TaskActionType.Unassign,
    TaskActionType.Finish,
  ],

  [TaskType.Unknown]: [],
};

export { taskTypeToActionAvailability };
