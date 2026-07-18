import { Override } from '@/shared/lib';
import { GroupId } from '../domain';
import { GetGroupByIdQuery } from '../schemas/groups.schema.generated';

type GroupById = Override<GetGroupByIdQuery['getGroup'], { id: GroupId }>;

type Query = Override<
  GetGroupByIdQuery,
  {
    getGroup: GroupById;
  }
>;

export type { Query, GroupById };
