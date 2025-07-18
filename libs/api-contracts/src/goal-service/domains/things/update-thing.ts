import { UpdateThingReq, UpdateThingRes } from './dtos';

export namespace GoalUpdateThing {
  export const pattern = 'goal.update-thing.command';

  export class Request extends UpdateThingReq {}

  export class Response extends UpdateThingRes {}
}
