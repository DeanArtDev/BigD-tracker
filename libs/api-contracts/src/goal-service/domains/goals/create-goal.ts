import { CreateGoalReq, CreateGoalRes } from './dtos';

export namespace GoalCreateGoal {
  export const pattern = 'goal.create-goal.query';

  export class Request extends CreateGoalReq {}

  export class Response extends CreateGoalRes {}
}
