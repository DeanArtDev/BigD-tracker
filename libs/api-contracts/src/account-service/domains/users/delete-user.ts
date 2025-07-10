import { DeleteUserRes, DeleteUserReq } from './dtos';

export namespace AccountDeleteUser {
  export const pattern = 'account.delete-user.command';
  export class Request extends DeleteUserReq {}
  export class Response extends DeleteUserRes {}
}
