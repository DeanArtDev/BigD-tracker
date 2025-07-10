import { StartGoalRes, StartGoalReq } from './dtos';

export namespace GoalStartGoal {
  export const pattern = 'goal.start-goal.query';

  export class Request extends StartGoalReq {}

  export class Response extends StartGoalRes {}
}
