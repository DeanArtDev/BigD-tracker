import { GetGroupListReq, GetGroupListRes } from './dtos';

export namespace GoalGetGroupList {
  export const pattern = 'goal.get-group-list.query';

  export class Request extends GetGroupListReq {}

  export class Response extends GetGroupListRes {}
}
