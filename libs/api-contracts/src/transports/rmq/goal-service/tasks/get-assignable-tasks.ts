import { GetAssignableTasksReq, GetAssignableTasksRes } from './dtos';

export namespace GoalGetAssignableTasks {
  export const pattern = 'goal.get-assignable-tasks.query';

  export class Request extends GetAssignableTasksReq {}

  export class Response extends GetAssignableTasksRes {}
}
