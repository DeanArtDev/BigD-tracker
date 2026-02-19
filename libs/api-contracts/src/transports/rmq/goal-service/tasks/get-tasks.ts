import { GetTasksReq, GetTasksRes } from './dtos';

export namespace GoalGetTasks {
  export const pattern = 'goal.get-tasks.query';

  export class Request extends GetTasksReq {}

  export class Response extends GetTasksRes {}
}
