import { RefreshReq, RefreshRes } from './dtos';

export namespace AccountRefresh {
  export const pattern = 'account.refresh.command';

  export class Request extends RefreshReq {}

  export class Response extends RefreshRes {}
}
