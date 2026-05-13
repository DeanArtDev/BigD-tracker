import { UserPasswordHash } from '@/modules/auth/domain/value-objects';
import { UserType } from '@big-d/api-contracts';
import { Email } from '@big-d/api-utils';

interface UserViewState {
  readonly id: number;
  readonly email: Email;
  readonly passwordHash: UserPasswordHash;
  readonly type: UserType;
  readonly screenName?: string;
  readonly avatar?: string;
}

class UserView {
  constructor(
    public readonly id: number,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly type: UserType,
    public readonly screenName?: string,
    public readonly avatar?: string,
  ) {}

  static restore(input: UserViewState): UserView {
    return new UserView(
      input.id,
      input.email.value,
      input.passwordHash.value,
      input.type,
      input.screenName,
      input.avatar,
    );
  }
}

export { UserView };
