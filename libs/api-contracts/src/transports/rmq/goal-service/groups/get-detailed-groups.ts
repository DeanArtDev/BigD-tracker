import { GetDetailedGroupsReq, GetDetailedGroupsRes } from './dtos';

export namespace GoalGetDetailedGroups {
  export const pattern = 'goal.get-detailed-groups.query';

  export class Request extends GetDetailedGroupsReq {}

  export class Response extends GetDetailedGroupsRes {}
}
