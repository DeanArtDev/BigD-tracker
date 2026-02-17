import { GetAssignableGroupsReq, GetAssignableGroupsRes } from './dtos';

export namespace GoalGetAssignableGroups {
  export const pattern = 'goal.get-assignable-groups.query';

  export class Request extends GetAssignableGroupsReq {}

  export class Response extends GetAssignableGroupsRes {}
}
