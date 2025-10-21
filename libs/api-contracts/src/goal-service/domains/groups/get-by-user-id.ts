import { GetGroupsByUserIdReq, GetGroupsByUserIdRes } from './dtos';

export namespace GoalGetGroupsByUserId {
  export const pattern = 'goal.groups-by-user-id.query';

  export class Request extends GetGroupsByUserIdReq {}

  export class Response extends GetGroupsByUserIdRes {}
}
