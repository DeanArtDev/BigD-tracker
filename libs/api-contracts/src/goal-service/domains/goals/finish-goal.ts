import { FinishGoalReq, FinishGoalRes } from './dtos';

export namespace GoalFinishGoal {
  export const pattern = 'goal.finish-goal.query';

  export class Request extends FinishGoalReq {}

  export class Response extends FinishGoalRes {}
}
