import { MaybePromise } from '../type-helpers';

abstract class BaseValueObject {
  public abstract equals(value: this): MaybePromise<boolean>;
}

export { BaseValueObject };
