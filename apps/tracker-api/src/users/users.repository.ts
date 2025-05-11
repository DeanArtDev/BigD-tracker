// users.repository.ts
import { ConflictException, Injectable } from '@nestjs/common';
import { KyselyService } from '@shared/modules/db';
import { CreateUserDto } from './schemas/create-user.dto';

@Injectable()
export class UsersRepository {
  constructor(private kyselyService: KyselyService) {}

  async getAll() {
    return await this.kyselyService.db.selectFrom('users').selectAll().execute();
  }

  async create({ name, email }: CreateUserDto) {
    const existedUser = await this.kyselyService.db
      .selectFrom('users')
      .where('email', '=', email)
      .executeTakeFirst();

    if (existedUser != null) {
      throw new ConflictException('User with this email already exists');
    }

    return await this.kyselyService.db
      .insertInto('users')
      .values({ name, email, created_at: new Date() })
      .returning(['id', 'name', 'email', 'avatar'])
      .executeTakeFirst();
  }
}
