import { CreateTaskInInboxRes, CreateTaskInInboxReq } from './dtos';

export namespace GoalCreateTaskInInbox {
  export const pattern = 'goal.create-task-in-inbox.command';

  export class Request extends CreateTaskInInboxReq {}

  export class Response extends CreateTaskInInboxRes {}
}
