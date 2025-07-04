import { MeReq, MeRes } from './dtos/me.dto';

export namespace AccountGetMe {
  export const pattern = 'account.me.query';
  export class Request extends MeReq {}
  export class Response extends MeRes {}
}
