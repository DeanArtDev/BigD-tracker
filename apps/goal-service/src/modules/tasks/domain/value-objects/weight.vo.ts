import { ExceptionTaskDomainInvalidInvariant } from '@/modules/tasks/domain/exceptions';
import { BaseValueObject } from '@big-d/api-utils';

class Weight implements BaseValueObject {
  #state: number;

  private constructor(state: number) {
    this.#state = state;
  }

  get value(): number {
    return this.#state;
  }

  static defaultValue(): Weight {
    return new Weight(100);
  }

  public static create(value: number): Weight {
    if (value < 0 || value > 100) {
      throw new ExceptionTaskDomainInvalidInvariant({
        message: 'Priority available value range is from 0 to 100',
        field: 'weight',
      });
    }

    return new Weight(value);
  }

  public static restore(value: number): Weight {
    return new Weight(value);
  }

  public equals(other: Weight): boolean {
    return this.#state === other.value;
  }
}

export { Weight };
