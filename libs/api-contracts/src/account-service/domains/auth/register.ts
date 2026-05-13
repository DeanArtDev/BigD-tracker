import { RegisterReq, RegisterRes } from './dtos';

export namespace AuthRegister {
  export const pattern = 'auth.register.command';

  export class Request extends RegisterReq {}

  export class Response extends RegisterRes {}
}
