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

type OmitCreateFields<
  T extends {
    id?: number | undefined;
    created_at?: string | Date | undefined;
    updated_at?: string | Date | undefined;
  },
> = Omit<T, 'id' | 'created_at' | 'updated_at'>;

export type { HasId, Override, ValueOf, Nullable, Undefinedable, OmitCreateFields };
