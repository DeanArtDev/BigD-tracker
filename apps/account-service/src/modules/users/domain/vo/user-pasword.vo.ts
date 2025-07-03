import * as bcrypt from 'bcrypt';

export class UserPassword {
  private constructor(
    private readonly hash: string,
    private readonly salt: string,
  ) {}

  public static async create(password: string): Promise<UserPassword> {
    UserPassword.ensureValid(password);
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(password, salt);
    return new UserPassword(hash, salt);
  }

  public static restore(password: string): UserPassword {
    return new UserPassword(password, bcrypt.genSaltSync());
  }

  private static ensureValid(plain: string): void {
    if (plain == null || plain.length < 6) {
      throw new Error('UserPassword must be at least 6 characters');
    }
  }

  public compare(plain: string): boolean {
    return bcrypt.compareSync(plain, this.hash);
  }

  public async change(plain: string): Promise<UserPassword> {
    return UserPassword.create(plain);
  }

  get value(): string {
    return this.hash;
  }
}
