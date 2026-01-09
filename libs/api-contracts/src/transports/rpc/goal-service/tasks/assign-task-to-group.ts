import { AssignTaskToGroupReq, AssignTaskToGroupRes } from './dtos';

export namespace GoalAssignTaskToGroup {
  export const pattern = 'goal.assign-task-to-group.command';

  export class Request extends AssignTaskToGroupReq {}

  export class Response extends AssignTaskToGroupRes {}
}
