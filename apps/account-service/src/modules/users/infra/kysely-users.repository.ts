import { UserPassword } from '@/modules/users/domain';
import { BaseRepository, Email } from '@big-d/api-utils';
import { Database, DATABASE_CONNECTION, DB } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'kysely';
import { UserRawData, UsersRepository } from '../application';
import { UserEntity } from '../domain/user.entity';

@Injectable()
export class KyselyUsersRepository extends BaseRepository<DB> implements UsersRepository {
  constructor(@Inject(DATABASE_CONNECTION) private readonly database: Database<DB>) {
    super(database);
  }

  async findUserById({ id }: { id: number }, trx?: Transaction<DB>): Promise<UserEntity | null> {
    const result = await this.db(trx)
      .selectFrom('users')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst();

    if (result == null) return null;
    return this.#map(result);
  }

  async findUserByEmail(
    { email }: { email: string },
    trx?: Transaction<DB>,
  ): Promise<UserEntity | null> {
    const result = await this.db(trx)

      .selectFrom('users')
      .where('email', '=', email)
      .selectAll()
      .executeTakeFirst();

    if (result == null) return null;
    return this.#map(result);
  }

  async findUserByScreeName(
    { screenName }: { screenName: string },
    trx?: Transaction<DB>,
  ): Promise<UserEntity | null> {
    const result = await this.db(trx)
      .selectFrom('users')
      .where('screen_name', '=', screenName)
      .selectAll()
      .executeTakeFirst();

    if (result == null) return null;
    return this.#map(result);
  }

  async create(
    { passwordHash, email }: UserEntity,
    trx?: Transaction<DB>,
  ): Promise<UserEntity | null> {
    const result = await this.db(trx)
      .insertInto('users')
      .values({ password_hash: passwordHash, email })
      .returningAll()
      .executeTakeFirst();

    if (result == null) return null;
    return this.#map(result);
  }

  async delete(id: number, trx?: Transaction<DB>): Promise<boolean> {
    const result = await this.db(trx).deleteFrom('users').where('id', '=', id).executeTakeFirst();

    return result.numDeletedRows > 0;
  }

  #map = (raw: UserRawData['selectable']): UserEntity => {
    return UserEntity.restore({
      id: raw.id,
      screenName: raw.screen_name ?? undefined,
      avatar: raw.avatar ?? undefined,
      email: Email.restore(raw.email),
      password: UserPassword.restore(raw.password_hash),
    });
  };
}
