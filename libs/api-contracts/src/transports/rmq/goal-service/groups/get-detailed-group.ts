import { GetDetailedGroupReq, GetDetailedGroupRes } from './dtos';

export namespace GoalGetDetailedGroup {
  export const pattern = 'goal.get-detailed-group.query';

  export class Request extends GetDetailedGroupReq {}

  export class Response extends GetDetailedGroupRes {}
}
