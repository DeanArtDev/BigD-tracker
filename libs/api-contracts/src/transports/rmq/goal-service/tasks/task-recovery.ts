import { TaskRecoveryReq, TaskRecoveryRes } from './dtos';

export namespace GoalTaskRecovery {
  export const pattern = 'goal.task-recovery.command';

  export class Request extends TaskRecoveryReq {}

  export class Response extends TaskRecoveryRes {}
}
