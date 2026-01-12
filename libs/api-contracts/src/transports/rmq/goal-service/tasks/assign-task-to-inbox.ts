import { AssignTaskToInboxReq, AssignTaskToInboxRes } from './dtos';

export namespace GoalAssignTaskToInbox {
  export const pattern = 'goal.assign-task-to-inbox.command';

  export class Request extends AssignTaskToInboxReq {}

  export class Response extends AssignTaskToInboxRes {}
}
