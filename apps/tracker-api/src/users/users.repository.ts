import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { KyselyService } from '@shared/modules/db';

@Injectable()
export class UsersRepository {
  constructor(private kyselyService: KyselyService) {}

  async getAll() {
    return await this.kyselyService.db.selectFrom('users').selectAll().execute();
  }

  async findUserByEmail({ email }: { email: string }) {
    return await this.kyselyService.db
      .selectFrom('users')
      .where('email', '=', email)
      .executeTakeFirst();
  }

  async findUserById({ id }: { id: number }) {
    return await this.kyselyService.db
      .selectFrom('users')
      .where('id', '=', id)
      .executeTakeFirst();
  }

  async findUserByScreeName({ screenName }: { screenName: string }) {
    return await this.kyselyService.db
      .selectFrom('users')
      .where('screen_name', '=', screenName)
      .executeTakeFirst();
  }

  async create({ passwordHash, email }: { passwordHash: string; email: string }) {
    return await this.kyselyService.db
      .insertInto('users')
      .values({ password_hash: passwordHash, email, created_at: new Date() })
      .returning(['id', 'screen_name', 'email', 'avatar'])
      .executeTakeFirst();
  }
}
