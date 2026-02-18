import type { ApiDto } from '@/shared/api/types';

type GroupDto = ApiDto['GroupDto'];

interface GroupInfoEntity {
  readonly id: GroupDto['id'];
  readonly name: GroupDto['name'];
}

export type { GroupInfoEntity };
