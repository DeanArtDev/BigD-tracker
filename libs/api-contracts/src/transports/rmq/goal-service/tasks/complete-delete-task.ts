import { CompleteDeleteTaskReq, CompleteDeleteTaskRes } from './dtos';

export namespace GoalCompleteDeleteTask {
  export const pattern = 'goal.complete-delete-task.command';

  export class Request extends CompleteDeleteTaskReq {}

  export class Response extends CompleteDeleteTaskRes {}
}
