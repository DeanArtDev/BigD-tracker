import { GetGroupInfoReq, GetGroupInfoRes } from './dtos';

export namespace GoalGetGroupInfo {
  export const pattern = 'goal.get-group-info.query';

  export class Request extends GetGroupInfoReq {}

  export class Response extends GetGroupInfoRes {}
}
