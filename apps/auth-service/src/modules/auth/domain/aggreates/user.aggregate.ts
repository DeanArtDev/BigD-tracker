import { UserType } from '@big-d/api-contracts';
import { Email } from '@big-d/api-utils';
import { AggregateRoot } from '@nestjs/cqrs';
import { ExceptionAuthInvalidInvariant } from '../exceptions';
import { UserPasswordHash } from '../value-objects';

interface UserState {
  readonly id: number;
  readonly email: Email;
  readonly passwordHash: UserPasswordHash;
  readonly type: UserType;
  readonly screenName?: string;
  readonly avatar?: string;
}

interface UserRestoreInput {
  readonly id: number;
  readonly email: Email;
  readonly passwordHash: UserPasswordHash;
  readonly type: UserType;
  readonly screenName?: string;
  readonly avatar?: string;
}

interface UserCreateInput {
  readonly email: Email;
  readonly passwordHash: UserPasswordHash;
  readonly screenName?: string;
  readonly avatar?: string;
}

class User extends AggregateRoot {
  #state: UserState;

  private constructor(input: Readonly<UserState>) {
    super();

    this.#state = input;
  }

  static restore(input: UserRestoreInput): User {
    return new User({
      id: input.id,
      email: input.email,
      passwordHash: input.passwordHash,
      type: input.type,
      screenName: input.screenName,
      avatar: input.avatar,
    });
  }

  static create(input: UserCreateInput): User {
    if (input.passwordHash.value.trim().length < 8) {
      throw new ExceptionAuthInvalidInvariant({
        field: 'passwordHash',
        message: 'Password must be at least 8 characters',
      });
    }

    return new User({
      id: NaN,
      email: input.email,
      passwordHash: input.passwordHash,
      type: UserType.NOT_VERIFIED,
      screenName: input.screenName,
      avatar: input.avatar,
    });
  }

  get id() {
    return this.#state.id;
  }
  get email() {
    return this.#state.email.value;
  }
  get passwordHash() {
    return this.#state.passwordHash.value;
  }
  get screenName() {
    return this.#state.screenName;
  }
  get avatar() {
    return this.#state.avatar;
  }
  get type() {
    return this.#state.type;
  }

  get isDraft(): boolean {
    return Number.isNaN(this.#state.id);
  }
}

export { User };
