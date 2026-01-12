import { CreateTaskReq, CreateTaskRes } from './dtos';

export namespace GoalCreateTask {
  export const pattern = 'goal.create-task.command';

  export class Request extends CreateTaskReq {}

  export class Response extends CreateTaskRes {}
}
