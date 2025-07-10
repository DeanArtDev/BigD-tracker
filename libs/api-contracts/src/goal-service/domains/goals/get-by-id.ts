import { GetGoalByIdRes, GetGoalByIdReq } from './dtos';

export namespace GoalGetGroupById {
  export const pattern = 'goal.group-by-id.query';

  export class Request extends GetGoalByIdReq {}

  export class Response extends GetGoalByIdRes {}
}
