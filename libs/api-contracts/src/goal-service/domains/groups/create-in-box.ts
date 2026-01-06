import { CreateInboxGroupReq, CreateInboxGroupRes } from './dtos';

export namespace GoalCreateInboxGroup {
  export const pattern = 'goal.create-in-box-group.command';

  export class Request extends CreateInboxGroupReq {}

  export class Response extends CreateInboxGroupRes {}
}
