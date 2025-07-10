import { UpdateGoalReq, UpdaeGoalRes } from './dtos';

export namespace GoalUpdateGoal {
  export const pattern = 'goal.update-goal.query';

  export class Request extends UpdateGoalReq {}

  export class Response extends UpdaeGoalRes {}
}
