import { AuthDatabase, AuthTransaction, UserWriteRepository } from '@/modules/auth/application/ports';
import { AuthSpecification } from '@/modules/auth/application/specifications';
import { User } from '@/modules/auth/domain/aggreates';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { UserWriteKyselyMapper } from '../../mappers';
import { BaseTasksRepository } from '../base-tasks.repository';
import { taskRecurrencesQuery, userTypeByNameQuery } from '../utils/queries';

@Injectable()
export class UsersWriteRepositoryKysely extends BaseTasksRepository implements UserWriteRepository {
  constructor(@Inject(databaseToken.CONNECTION) private readonly db: AuthDatabase) {
    super();
  }

  async create(user: User, trx?: AuthTransaction): Promise<User> {
    return await this.errorCatcher('users.create-user', async () => {
      const { id: userTypeId, name: userTypeName } = await userTypeByNameQuery(
        [user.type],
        this.db,
        trx,
      ).executeTakeFirstOrThrow();

      const newUser = await this.db
        .qb(trx)
        .insertInto('users')
        .values({
          email: user.email,
          password_hash: user.passwordHash,
          type_id: userTypeId,
          avatar: user.avatar,
          screen_name: user.screenName,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return UserWriteKyselyMapper.fromRawToAgr({ ...newUser, type: userTypeName });
    });
  }

  async getOneUser(specifications: AuthSpecification, trx?: AuthTransaction): Promise<User | null> {
    return await this.errorCatcher('users.write.get-one-user', async () => {
      const user = await taskRecurrencesQuery(this.db, trx)
        .where((eb) => specifications.toExpr(eb))
        .executeTakeFirst();
      if (user == null) return null;

      return UserWriteKyselyMapper.fromRawToAgr(user);
    });
  }
}
