import { UpdateGroupRes, UpdateGroupReq } from './dtos';

export namespace GoalUpdateGroup {
  export const pattern = 'goal.update-group.command';

  export class Request extends UpdateGroupReq {}

  export class Response extends UpdateGroupRes {}
}
