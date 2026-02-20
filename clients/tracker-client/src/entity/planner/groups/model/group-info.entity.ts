import type { ApiSchemas } from '@/shared/api/types';

type GroupDto = ApiSchemas['GroupDto'];

interface GroupInfoEntity {
  readonly id: GroupDto['id'];
  readonly name: GroupDto['name'];
}

export type { GroupInfoEntity };
