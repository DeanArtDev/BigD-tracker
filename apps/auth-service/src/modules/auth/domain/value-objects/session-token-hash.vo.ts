class SessionTokenHash {
  #value: string;

  private constructor(private readonly hash: string) {
    this.#value = hash;
  }

  static create(hash: string) {
    return new SessionTokenHash(hash);
  }

  static restore(hash: string) {
    return new SessionTokenHash(hash);
  }

  get value() {
    return this.#value;
  }
}

export { SessionTokenHash };
