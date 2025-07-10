import { GetGoalByUserIdReq, GetGoalByUserIdRes } from './dtos';

export namespace GoalGetGroupByUserId {
  export const pattern = 'goal.group-by-user-id.query';

  export class Request extends GetGoalByUserIdReq {}

  export class Response extends GetGoalByUserIdRes {}
}
