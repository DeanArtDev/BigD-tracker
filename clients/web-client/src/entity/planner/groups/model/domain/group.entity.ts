import { Brand, DeepReadonly } from '@/shared/lib';

type GroupId = Brand<number, 'TaskId'>;

type GroupEntity<TData extends Record<string, unknown>> = Omit<DeepReadonly<TData>, 'id'> & {
  readonly id: GroupId;
};

export type { GroupId, GroupEntity };
