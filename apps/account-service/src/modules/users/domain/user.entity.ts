import { UserPassword } from '@/modules/users/domain/vo/user-pasword.vo';
import { DomainValidator, Email } from '@big-d/api-utils';
import { AggregateRoot } from '@nestjs/cqrs';
import { randomInt } from 'crypto';

const validator = new DomainValidator('users');

interface UserData {
  readonly id: number;
  password: UserPassword;
  email: Email;
  avatar?: string;
  screenName?: string;
}

interface CreateData {
  readonly email: Email;
  readonly passwordHash: UserPassword;
}

class UserEntity extends AggregateRoot {
  #data: UserData;
  protected constructor(init: UserData) {
    super();
    this.#data = init;
  }

  static create(data: CreateData) {
    return new UserEntity({
      id: randomInt(0, Date.now()),
      email: data.email,
      password: data.passwordHash,
    }).validate();
  }

  static restore(data: UserData) {
    return new UserEntity({
      id: data.id,
      email: data.email,
      password: data.password,
      avatar: data?.avatar,
      screenName: data?.screenName,
    });
  }

  public validate() {
    const { id, screenName, avatar } = this.#data;

    if (screenName != null) validator.isNotStringEmpty(screenName, 'screenName');
    if (avatar != null) validator.isNotStringEmpty(avatar, 'avatar');

    validator.isIdValId(id, 'id');

    return this;
  }

  public validatePassword(passwordHash: string) {
    return this.#data.password.compare(passwordHash);
  }

  get id() {
    return this.#data.id;
  }
  get passwordHash() {
    return this.#data.password.value;
  }
  get email() {
    return this.#data.email.value;
  }
  get avatar() {
    return this.#data.avatar;
  }
  get screenName() {
    return this.#data.screenName;
  }
}

export { UserEntity, UserData };
