import { RefreshReq, RefreshRes } from './dtos';

export namespace AuthRefresh {
  export const pattern = 'auth.refresh.command';

  export class Request extends RefreshReq {}

  export class Response extends RefreshRes {}
}
