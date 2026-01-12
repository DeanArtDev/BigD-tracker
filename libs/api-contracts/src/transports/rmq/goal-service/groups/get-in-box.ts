import { GetInBoxGroupReq, GetInBoxGroupRes } from './dtos';

export namespace GoalGetGroupInBox {
  export const pattern = 'goal.in-box.query';

  export class Request extends GetInBoxGroupReq {}

  export class Response extends GetInBoxGroupRes {}
}
