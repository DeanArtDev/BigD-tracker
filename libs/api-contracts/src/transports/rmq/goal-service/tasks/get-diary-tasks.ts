import { GetDiaryTasksReq, GetDiaryTasksRes } from './dtos';

export namespace GoalGetDiaryTasks {
  export const pattern = 'goal.get-diary-tasks.query';

  export class Request extends GetDiaryTasksReq {}

  export class Response extends GetDiaryTasksRes {}
}
