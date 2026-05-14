import { DeleteUserRes, DeleteUserReq } from './dtos';

export namespace AuthDeleteUser {
  export const pattern = 'auth.delete-user.command';
  export class Request extends DeleteUserReq {}
  export class Response extends DeleteUserRes {}
}
