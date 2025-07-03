import { OmitCreateFields, Override } from '@big-d/api-utils';
import { Insertable, Transaction, Updateable } from 'kysely';
import { Selectable } from 'kysely/dist/esm';
import { DB } from '@big-d/database';
import { UserEntity } from '../domain/user.entity';

interface UserRawData {
  readonly selectable: Omit<Selectable<DB['users']>, 'updated_at' | 'created_at'>;
  readonly updateable: Omit<
    Override<Updateable<DB['users']>, 'id', number>,
    'updated_at' | 'created_at'
  >;
  readonly insertable: OmitCreateFields<Insertable<DB['users']>>;
}

const USER_REPOSITORY = Symbol('USER_REPOSITORY');

interface UsersRepository {
  findUserById(input: { id: number }, trx?: Transaction<DB>): Promise<UserEntity | null>;
  findUserByEmail(input: { email: string }, trx?: Transaction<DB>): Promise<UserEntity | null>;
  findUserByScreeName(
    input: { screenName: string },
    trx?: Transaction<DB>,
  ): Promise<UserEntity | null>;
  create(input: UserEntity, trx?: Transaction<DB>): Promise<UserEntity | null>;
  delete(id: number): Promise<boolean>;
}

export { UserRawData, UsersRepository, USER_REPOSITORY };
