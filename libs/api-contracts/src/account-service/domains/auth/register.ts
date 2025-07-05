import { RegisterReq, RegisterRes } from './dtos';

export namespace AccountRegister {
  export const pattern = 'account.register.command';

  export class Request extends RegisterReq {}

  export class Response extends RegisterRes {}
}
