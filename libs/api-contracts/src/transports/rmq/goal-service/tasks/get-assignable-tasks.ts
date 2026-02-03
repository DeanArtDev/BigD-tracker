import { GetAssignableTasksToGroupReq, GetAssignableTasksToGroupRes } from './dtos';

export namespace GoalGetAssignableTasksToGroup {
  export const pattern = 'goal.get-assignable-tasks-to-group.query';

  export class Request extends GetAssignableTasksToGroupReq {}

  export class Response extends GetAssignableTasksToGroupRes {}
}
