import { MaybePromise } from '../type-helpers';

abstract class BaseValueObject<TValue> {
  public abstract equals(value: TValue): MaybePromise<boolean>;
}

export { BaseValueObject };
