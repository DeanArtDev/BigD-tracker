import { FinishThingReq, FinishThingRes } from './dtos';

export namespace GoalFinishThing {
  export const pattern = 'goal.finish-thing.query';

  export class Request extends FinishThingReq {}

  export class Response extends FinishThingRes {}
}
