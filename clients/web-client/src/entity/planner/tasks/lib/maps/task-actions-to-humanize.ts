import { TaskActionType } from '../../model';

const taskActionToHumanize: Record<TaskActionType, string> = {
  FINISH: 'завершить',
  DELETE: 'удалить',
  CLONE: 'дублировать',
  ASSIGN: 'в группу',
  UNASSIGN: 'убрать из группы',
  RECOVER: 'восстановить',
  DELETE_COMPLETE: 'удалить полностью',
};

export { taskActionToHumanize };
