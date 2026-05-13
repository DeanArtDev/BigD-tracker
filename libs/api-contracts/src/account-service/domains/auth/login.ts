import { LoginRes, LoginReq } from './dtos';

export namespace AuthLogin {
  export const pattern = 'auth.login.command';

  export class Request extends LoginReq {}

  export class Response extends LoginRes {}
}
