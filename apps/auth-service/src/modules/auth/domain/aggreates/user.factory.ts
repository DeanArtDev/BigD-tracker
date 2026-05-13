import { Email } from '@big-d/api-utils';
import { UserPasswordHash } from '../value-objects';
import { User } from './user.aggregate';

interface UserCreateInput {
  readonly email: string;
  readonly passwordHash: UserPasswordHash;
  readonly screenName?: string;
  readonly avatar?: string;
}

class UserFactory {
  static create(input: UserCreateInput): User {
    return User.create({
      email: Email.create(input.email),
      passwordHash: input.passwordHash,
      screenName: input.screenName,
      avatar: input.avatar,
    });
  }
}

export { UserFactory };
