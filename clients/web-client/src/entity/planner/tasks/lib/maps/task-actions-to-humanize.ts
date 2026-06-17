import { TaskActionType } from '../../model';

const taskActionToHumanize: Record<TaskActionType, string> = {
  FINISH: 'завершить',
  DELETE: 'удалить',
  CLONE: 'дублировать',
  ASSIGN: 'переместить',
  UNASSIGN: 'открепить',
  RECOVER: 'восстановить',
  DELETE_COMPLETE: 'удалить полностью',
};

export { taskActionToHumanize };
