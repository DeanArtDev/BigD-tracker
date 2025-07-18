import { DeleteThingReq, DeleteThingRes } from './dtos';

export namespace GoalDeleteThing {
  export const pattern = 'goal.delete-thing.command';

  export class Request extends DeleteThingReq {}

  export class Response extends DeleteThingRes {}
}
