import { GetGroupRes, GetGroupReq } from './dtos';

export namespace GoalGetGroup {
  export const pattern = 'goal.get-group.query';

  export class Request extends GetGroupReq {}

  export class Response extends GetGroupRes {}
}
