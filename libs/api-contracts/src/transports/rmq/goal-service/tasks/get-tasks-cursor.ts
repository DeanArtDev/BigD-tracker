import { GetTasksReq, GetTasksRes } from './dtos';

export namespace GoalGetTasksCursor {
  export const pattern = 'goal.get-tasks-cursor.query';

  export class Request extends GetTasksReq {}

  export class Response extends GetTasksRes {}
}
