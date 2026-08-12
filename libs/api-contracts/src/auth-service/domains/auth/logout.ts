import { LogoutRes, LogoutReq } from './dtos';

export namespace AuthLogout {
  export const pattern = 'auth.logout.command';

  export class Request extends LogoutReq {}

  export class Response extends LogoutRes {}
}
