import { GetTasksByRangeRes, GetTasksByRangeReq } from './dtos';

export namespace GoalGetTasksByRange {
  export const pattern = 'goal.get-tasks-by-range.query';

  export class Request extends GetTasksByRangeReq {}

  export class Response extends GetTasksByRangeRes {}
}
