import { DeleteGoalReq, DeleteGoalRes } from './dtos';

export namespace GoalDeleteGoal {
  export const pattern = 'goal.delete-goal.query';

  export class Request extends DeleteGoalReq {}

  export class Response extends DeleteGoalRes {}
}
