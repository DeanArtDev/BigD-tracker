import { OmitCreateFields, Override } from '@big-d/api-utils';
import { Insertable, Updateable } from 'kysely';
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
  findUserById({ id }: { id: number }): Promise<UserEntity | null>;
  findUserByEmail({ email }: { email: string }): Promise<UserEntity | null>;
  findUserByScreeName({ screenName }: { screenName: string }): Promise<UserEntity | null>;
  create(data: UserEntity): Promise<UserEntity | null>;
}

export { UserRawData, UsersRepository, USER_REPOSITORY };
