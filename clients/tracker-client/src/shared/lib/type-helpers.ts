type Override<Entity extends Record<string, any>, Key extends keyof Entity, Type> = Omit<Entity, Key> &
  Record<Key, Type>;

type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type ValueOf<Type> = Type[keyof Type];

type DeepRequired<T> = {
  [K in keyof T]-?: Required<T[K]>;
};

type DeepPartial<T> = {
  [K in keyof T]?: DeepPartial<T[K]>;
};

type Nullable<T> = {
  [P in keyof T]: T[P] extends object | [] ? Nullable<T[P]> : T[P] | null;
};

interface HasId {
  readonly id: number | string;
}

export type { HasId, Override, ValueOf, Nullable, DeepRequired, DeepPartial, MakeOptional };
