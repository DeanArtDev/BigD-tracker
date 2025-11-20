import { GetThingsRes, GetThingsReq } from './dtos';

export namespace GetThing {
  export const pattern = 'goal.things.query';

  export class Request extends GetThingsReq {}

  export class Response extends GetThingsRes {}
}
