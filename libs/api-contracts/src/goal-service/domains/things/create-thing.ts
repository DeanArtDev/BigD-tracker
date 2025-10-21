import { CreateThingRes, CreateThingReq } from './dtos';

export namespace GoalCreateThing {
  export const pattern = 'goal.create-thing.command';

  export class Request extends CreateThingReq {}

  export class Response extends CreateThingRes {}
}
