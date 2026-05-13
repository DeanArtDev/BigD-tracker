import { UserView } from '@/modules/auth/application/dto';
import { AuthDatabase, AuthTransaction, UserReadRepository } from '@/modules/auth/application/ports';
import { AuthSpecification } from '@/modules/auth/application/specifications';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { UserReadKyselyMapper } from '../../mappers';
import { BaseTasksRepository } from '../base-tasks.repository';
import { taskRecurrencesQuery } from '../utils/queries';

@Injectable()
export class UsersReadRepositoryKysely extends BaseTasksRepository implements UserReadRepository {
  constructor(@Inject(databaseToken.CONNECTION) private readonly db: AuthDatabase) {
    super();
  }

  async getOneUser(specifications: AuthSpecification, trx?: AuthTransaction): Promise<UserView | null> {
    return await this.errorCatcher('users.read.get-one-user', async () => {
      const user = await taskRecurrencesQuery(this.db, trx)
        .where((eb) => specifications.toExpr(eb))
        .executeTakeFirst();
      if (user == null) return null;

      return UserReadKyselyMapper.fromRawToView(user);
    });
  }
}
