import { LogoutRes, LogoutReq } from './dtos';

export namespace AccountLogout {
  export const pattern = 'account.logout.command';

  export class Request extends LogoutReq {}

  export class Response extends LogoutRes {}
}
