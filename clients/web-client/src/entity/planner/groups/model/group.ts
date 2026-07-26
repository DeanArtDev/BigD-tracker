import { Brand } from '@/shared/lib';

type GroupId = Brand<number, 'GroupId'>;

interface Group {
  readonly id: GroupId;
  readonly name: string;
  readonly description?: string;
}

type GroupInfo = Pick<Group, 'id' | 'name'>;

export type { GroupId, Group, GroupInfo };
