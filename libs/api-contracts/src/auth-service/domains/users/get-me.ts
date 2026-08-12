import { MeReq, MeRes } from './dtos/me.dto';

export namespace AuthGetMe {
  export const pattern = 'auth.me.query';
  export class Request extends MeReq {}
  export class Response extends MeRes {}
}
