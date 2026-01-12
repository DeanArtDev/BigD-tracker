import { ExceptionDomainInvalidInvariant } from '@/modules/tasks/domain/errors';
import { BaseValueObject } from '@big-d/api-utils';

class ProgressVo implements BaseValueObject {
  #state: number;

  private constructor(state: number) {
    this.#state = state;
  }

  get value(): number {
    return this.#state;
  }

  static defaultValue(): ProgressVo {
    return new ProgressVo(0);
  }

  public static create(value: number): ProgressVo {
    if (value < 0 || value > 100) {
      throw new ExceptionDomainInvalidInvariant({
        message: 'Progress available value range is from 0 to 100',
        field: 'progress',
      });
    }

    return new ProgressVo(value);
  }

  public static restore(value: number): ProgressVo {
    return new ProgressVo(value);
  }

  public equals(other: ProgressVo): boolean {
    return this.#state === other.value;
  }
}

export { ProgressVo };
