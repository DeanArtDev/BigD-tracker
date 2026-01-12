import { UpdateInboxTaskRes, UpdateInboxTaskReq } from './dtos';

export namespace GoalUpdateInboxTask {
  export const pattern = 'goal.update-inbox-task.command';

  export class Request extends UpdateInboxTaskReq {}

  export class Response extends UpdateInboxTaskRes {}
}
