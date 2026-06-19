import { Brand, DeepReadonly } from '@/shared/lib';

type GroupId = Brand<number, 'GroupId'>;

type BrandGroup<TData extends Record<string, unknown>> = Omit<DeepReadonly<TData>, 'id'> & {
  readonly id: GroupId;
};

interface Group {
  readonly id: GroupId;
  readonly name: string;
  readonly description?: string;
}

export type { GroupId, BrandGroup, Group };
