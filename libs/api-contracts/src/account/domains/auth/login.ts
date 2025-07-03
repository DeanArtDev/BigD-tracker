import { LoginRes, LoginReq } from './dtos';

export namespace AccountLogin {
  export const pattern = 'account.login.command';

  export class Request extends LoginReq {}

  export class Response extends LoginRes {}
}
