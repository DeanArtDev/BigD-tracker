import { CloneTaskReq, CloneTaskRes } from './dtos';

export namespace GoalCloneTask {
  export const pattern = 'goal.clone-task.command';

  export class Request extends CloneTaskReq {}

  export class Response extends CloneTaskRes {}
}
