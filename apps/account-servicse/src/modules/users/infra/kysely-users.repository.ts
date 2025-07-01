import { UserPassword } from '@/modules/users/domain';
import { Email } from '@big-d/api-utils';
import { Database, DATABASE_CONNECTION } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { UsersRepository, UserRawData } from '../application/users.repository';
import { UserEntity } from '../domain/user.entity';

@Injectable()
export class KyselyUsersRepository implements UsersRepository {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  async findUserById({ id }: { id: number }): Promise<UserEntity | null> {
    const result = await this.db
      .selectFrom('users')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst();

    if (result == null) return null;
    return this.#map(result);
  }

  async findUserByEmail({ email }: { email: string }): Promise<UserEntity | null> {
    const result = await this.db

      .selectFrom('users')
      .where('email', '=', email)
      .selectAll()
      .executeTakeFirst();

    if (result == null) return null;
    return this.#map(result);
  }

  async findUserByScreeName({ screenName }: { screenName: string }): Promise<UserEntity | null> {
    const result = await this.db
      .selectFrom('users')
      .where('screen_name', '=', screenName)
      .selectAll()
      .executeTakeFirst();

    if (result == null) return null;
    return this.#map(result);
  }

  async create({ passwordHash, email }: UserEntity): Promise<UserEntity | null> {
    const result = await this.db
      .insertInto('users')
      .values({ password_hash: passwordHash, email })
      .returningAll()
      .executeTakeFirst();

    if (result == null) return null;
    return this.#map(result);
  }

  #map = (raw: UserRawData['selectable']): UserEntity => {
    return UserEntity.restore({
      id: raw.id,
      screenName: raw.screen_name ?? undefined,
      avatar: raw.avatar ?? undefined,
      email: Email.restore(raw.email),
      passwordHash: UserPassword.restore(raw.password_hash),
    });
  };
}
