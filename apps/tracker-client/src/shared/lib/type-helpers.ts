type Override<Entity extends Record<string, any>, Key extends keyof Entity, Type> = Omit<
  Entity,
  Key
> &
  Record<Key, Type>;

type ValueOf<Type> = Type[keyof Type];

export type { Override, ValueOf };
