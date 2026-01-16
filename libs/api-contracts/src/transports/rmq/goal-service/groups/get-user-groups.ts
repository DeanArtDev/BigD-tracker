import { GetUserGroupsReq, GetUserGroupsRes } from './dtos';

export namespace GoalGetUserGroups {
  export const pattern = 'goal.get-user-groups.query';

  export class Request extends GetUserGroupsReq {}

  export class Response extends GetUserGroupsRes {}
}
