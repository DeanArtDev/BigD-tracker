import { DeleteGroupReq, DeleteGroupRes } from './dtos';

export namespace GoalDeleteGroup {
  export const pattern = 'goal.delete-group.command';

  export class Request extends DeleteGroupReq {}

  export class Response extends DeleteGroupRes {}
}
