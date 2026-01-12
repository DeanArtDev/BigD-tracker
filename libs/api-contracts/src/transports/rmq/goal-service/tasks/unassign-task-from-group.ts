import { UnassignTaskFromGroupReq, UnassignTaskFromGroupRes } from './dtos';

export namespace GoalUnassignTaskFromGroup {
  export const pattern = 'goal.unassign-task-from-group.command';

  export class Request extends UnassignTaskFromGroupReq {}

  export class Response extends UnassignTaskFromGroupRes {}
}
