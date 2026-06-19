type Override<T, TOverrides> = Omit<T, keyof TOverrides> & TOverrides;

type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type MaybePromise<T> = T | Promise<T>;

type ValueOf<Type> = Type[keyof Type];

type DeepPartial<T> = {
  [K in keyof T]?: DeepPartial<T[K]>;
};

type Primitive = string | number | boolean | bigint | symbol | null | undefined;

type DeepReadonly<T> = T extends Primitive
  ? T
  : T extends (infer R)[]
    ? ReadonlyArray<DeepReadonly<R>>
    : T extends object
      ? {
          readonly [K in keyof T]: DeepReadonly<T[K]>;
        }
      : T;

type Nullable<T> = {
  [P in keyof T]: T[P] extends object | [] ? Nullable<T[P]> : T[P] | null;
};

interface HasId {
  readonly id: number | string;
}

type Brand<T, TBrand extends string> = T & {
  readonly __brand: TBrand;
};

export type { HasId, Override, ValueOf, Nullable, DeepPartial, MakeOptional, DeepReadonly, Brand, MaybePromise };
