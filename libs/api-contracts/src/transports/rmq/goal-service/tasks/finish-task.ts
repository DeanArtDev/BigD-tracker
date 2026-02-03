import { FinishTaskReq, FinishTaskRes } from './dtos';

export namespace GoalFinishTask {
  export const pattern = 'goal.finish-task.command';

  export class Request extends FinishTaskReq {}

  export class Response extends FinishTaskRes {}
}
