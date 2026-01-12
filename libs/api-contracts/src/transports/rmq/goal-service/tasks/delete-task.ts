import { DeleteTaskRes, DeleteTaskReq } from './dtos';

export namespace GoalDeleteTask {
  export const pattern = 'goal.delete-task.command';

  export class Request extends DeleteTaskReq {}

  export class Response extends DeleteTaskRes {}
}
