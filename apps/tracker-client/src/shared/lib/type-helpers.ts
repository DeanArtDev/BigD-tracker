type Override<Entity extends Record<string, any>, Key extends keyof Entity, Type> = Omit<
  Entity,
  Key
> &
  Record<Key, Type>;

type ValueOf<Type> = Type[keyof Type];

type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

type Undefinedable<T> = {
  [P in keyof T]+?: T[P] | undefined;
};

interface HasId {
  readonly id: number | string;
}

export type { HasId, Override, ValueOf, Nullable, Undefinedable };
