import { CreateThingIntoInboxReq, CreateThingIntoInboxRes } from './dtos';

export namespace GoalCreateThingIntoInBoxGroup {
  export const pattern = 'goal.create-thing-into-in-box.command';

  export class Request extends CreateThingIntoInboxReq {}

  export class Response extends CreateThingIntoInboxRes {}
}
