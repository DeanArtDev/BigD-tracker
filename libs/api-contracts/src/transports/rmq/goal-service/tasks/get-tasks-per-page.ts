import { GetTasksPerPageReq, GetTasksPerPageRes } from './dtos';

export namespace GoalGetTasksPerPage {
  export const pattern = 'goal.get-tasks-per-page.query';

  export class Request extends GetTasksPerPageReq {}

  export class Response extends GetTasksPerPageRes {}
}
