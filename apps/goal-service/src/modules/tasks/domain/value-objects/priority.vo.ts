import { ExceptionTaskDomainInvalidInvariant } from '@/modules/tasks/domain/exceptions';
import { BaseValueObject } from '@big-d/api-utils';

class Priority implements BaseValueObject {
  #state: number;

  private constructor(state: number) {
    this.#state = state;
  }

  get value(): number {
    return this.#state;
  }

  static defaultValue(): Priority {
    return new Priority(4);
  }

  public static create(value: number): Priority {
    if (value < 1 || value > 4) {
      throw new ExceptionTaskDomainInvalidInvariant({
        message: 'Priority available value range is from 1 to 4',
        field: 'priority',
      });
    }

    return new Priority(value);
  }

  public static restore(value: number): Priority {
    return new Priority(value);
  }

  public equals(other: Priority): boolean {
    return this.#state === other.value;
  }
}

export { Priority };
