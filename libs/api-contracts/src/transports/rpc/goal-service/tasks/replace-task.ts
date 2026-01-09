import { ReplaceTaskRes, ReplaceTaskReq } from './dtos';

export namespace GoalReplaceTask {
  export const pattern = 'goal.replace-task.command';

  export class Request extends ReplaceTaskReq {}

  export class Response extends ReplaceTaskRes {}
}
