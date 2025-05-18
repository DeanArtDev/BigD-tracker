import { Injectable } from '@nestjs/common';
import { KyselyService } from '@shared/modules/db';
import { ConfigService } from '@nestjs/config';
import { randomUUID, randomBytes } from 'crypto';

/*TODO:
 *  - удалять просроченные токены по крону, раз в неделю
 *  - в базе рефреш токены захешированы
 * */
@Injectable()
export class AuthRepository {
  constructor(
    private readonly configService: ConfigService,
    private readonly kyselyService: KyselyService,
  ) {}

  async findSessionByToken(token: string) {
    return await this.kyselyService.db
      .selectFrom('sessions')
      .where('token', '=', token)
      .select(['ip', 'uuid', 'users_id', 'user_agent', 'token', 'revoked', 'expires_at'])
      .executeTakeFirst();
  }

  async deleteSession(
    data: { token: string; userId: number } | { uuid: string; userId: number },
  ) {
    if ('uuid' in data) {
      const result = await this.kyselyService.db
        .deleteFrom('sessions')
        .where('uuid', '=', data.uuid)
        .where('users_id', '=', data.userId)
        .executeTakeFirst();

      return result.numDeletedRows > 0;
    }

    const result = await this.kyselyService.db
      .deleteFrom('sessions')
      .where('token', '=', data.token)
      .where('users_id', '=', data.userId)
      .executeTakeFirst();

    return result.numDeletedRows > 0;
  }

  async createSession(data: { ip?: string; userId: number; userAgent?: string }) {
    const uuid = randomUUID();
    const refreshToken = randomBytes(40).toString('hex');
    const expiresDate =
      Date.now() + (this.configService.get<number>('SESSION_REFRESH_TIME') ?? 0);

    const session = await this.kyselyService.db
      .insertInto('sessions')
      .values({
        uuid,
        token: refreshToken,
        revoked: false,
        ip: data.ip,
        user_agent: data.userAgent,
        users_id: data.userId,
        created_at: new Date(),
        expires_at: new Date(expiresDate),
      })
      .returning([
        'ip',
        'uuid',
        'token',
        'revoked',
        'users_id',
        'user_agent',
        'expires_at',
        'created_at',
      ])
      .executeTakeFirst();

    return { session };
  }
}
