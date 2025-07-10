import { CreateInBoxGroupReq, CreateInBoxGroupRes } from './dtos';

export namespace GoalCreateInBoxGroup {
  export const pattern = 'goal.create-in-box-group.command';

  export class Request extends CreateInBoxGroupReq {}

  export class Response extends CreateInBoxGroupRes {}
}
