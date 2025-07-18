class Priority {
  #value: number;
  private constructor(value: number) {
    this.#value = value;
  }

  get value(): number {
    return this.#value;
  }

  public static create(value: number): Priority {
    if (value < 1 || value > 4) {
      throw new Error('Priority available value range is from 1 to 4');
    }

    return new Priority(value);
  }

  public static restore(value: number): Priority {
    return new Priority(value);
  }

  public equals(other: Priority): boolean {
    return this.value === other.value;
  }
}

export { Priority };
