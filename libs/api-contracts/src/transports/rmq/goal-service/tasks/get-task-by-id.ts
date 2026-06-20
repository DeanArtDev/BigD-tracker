import { GetTaskByIdReq, GetTaskByIdRes } from './dtos';

export namespace GoalGetTaskById {
  export const pattern = 'goal.get-task-by-id.query';

  export class Request extends GetTaskByIdReq {}

  export class Response extends GetTaskByIdRes {}
}
