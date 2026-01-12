import { CreateGroupRes, CreateGroupReq } from './dtos';

export namespace GoalCreateGroup {
  export const pattern = 'goal.create-group.command';

  export class Request extends CreateGroupReq {}

  export class Response extends CreateGroupRes {}
}
