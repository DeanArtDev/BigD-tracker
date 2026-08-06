import { GetDiaryGroupListReq, GetDiaryGroupListRes } from './dtos';

export namespace GoalGetDiaryGroupList {
  export const pattern = 'goal.get-diary-group-list.query';

  export class Request extends GetDiaryGroupListReq {}

  export class Response extends GetDiaryGroupListRes {}
}
