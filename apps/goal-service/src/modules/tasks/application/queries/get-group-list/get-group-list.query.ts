import { Group } from '@/modules/tasks/domain/aggregates/group';

export class GetGroupListQuery {
  constructor(
    readonly input: {
      readonly userId: number;
      readonly search?: string;
      readonly limit: number;
      readonly lastId?: Group['id'];
    },
  ) {}
}
