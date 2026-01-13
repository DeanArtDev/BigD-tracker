import { ReplaceGroupReq, ReplaceGroupRes } from './dtos';

export namespace GoalReplaceGroup {
  export const pattern = 'goal.replace-group.command';

  export class Request extends ReplaceGroupReq {}

  export class Response extends ReplaceGroupRes {}
}
