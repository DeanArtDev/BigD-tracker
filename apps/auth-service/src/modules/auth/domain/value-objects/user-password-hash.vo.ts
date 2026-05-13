class UserPasswordHash {
  #value: string;

  private constructor(private readonly hash: string) {
    this.#value = hash;
  }

  static create(hash: string) {
    return new UserPasswordHash(hash);
  }

  static restore(hash: string) {
    return new UserPasswordHash(hash);
  }

  get value() {
    return this.#value;
  }
}

export { UserPasswordHash };
