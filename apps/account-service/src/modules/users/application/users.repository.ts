import { DB } from '@big-d/database';
import { Transaction } from 'kysely';
import { Selectable } from 'kysely/dist/esm';
import { UserEntity } from '../domain/user.entity';

interface UserRawData {
  readonly selectable: Omit<Selectable<DB['users']>, 'updated_at' | 'created_at'>;
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
