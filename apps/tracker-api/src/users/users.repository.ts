import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { KyselyService } from '@shared/modules/db';

@Injectable()
export class UsersRepository {
  constructor(private kyselyService: KyselyService) {}

  async getAll() {
    return await this.kyselyService.db.selectFrom('users').selectAll().execute();
  }

  async create({ passwordHash, email }: { passwordHash: string; email: string }) {
    const existedUser = await this.kyselyService.db
      .selectFrom('users')
      .where('email', '=', email)
      .executeTakeFirst();

    if (existedUser != null) {
      throw new ConflictException('User with this email already exists');
    }

    const newUser = await this.kyselyService.db
      .insertInto('users')
      .values({ password_hash: passwordHash, email, created_at: new Date() })
      .returning(['id', 'name', 'email', 'avatar'])
      .executeTakeFirst();

    if (newUser == null) {
      throw new BadRequestException({ email }, { cause: 'User could not be created' });
    }

    return newUser;
  }
}
