import { BaseValueObject } from '@big-d/api-utils';

class DescriptionVo implements BaseValueObject {
  #state: string;

  private constructor(state: string) {
    this.#state = state;
  }

  get value(): string {
    return this.#state;
  }

  public static create(value: string): DescriptionVo {
    return new DescriptionVo(value);
  }

  public static restore(value: string): DescriptionVo {
    return new DescriptionVo(value);
  }

  public equals(other: DescriptionVo): boolean {
    return this.#state === other.value;
  }
}

export { DescriptionVo };
