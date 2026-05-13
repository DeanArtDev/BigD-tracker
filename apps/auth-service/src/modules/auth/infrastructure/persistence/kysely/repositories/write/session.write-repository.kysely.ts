import { AuthDatabase, AuthTransaction, SessionWriteRepository } from '@/modules/auth/application/ports';
import { Session } from '@/modules/auth/domain/aggreates';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { SessionWriteKyselyMapper } from '../../mappers';
import { BaseTasksRepository } from '../base-tasks.repository';

@Injectable()
export class SessionWriteRepositoryKysely extends BaseTasksRepository implements SessionWriteRepository {
  constructor(@Inject(databaseToken.CONNECTION) private readonly db: AuthDatabase) {
    super();
  }

  async create(session: Session, trx?: AuthTransaction): Promise<Session> {
    return await this.errorCatcher('session.create-session', async () => {
      const newSession = await this.db
        .qb(trx)
        .insertInto('sessions')
        .values({
          user_id: session.userId,
          expires_at: session.expiresAt,
          token_hash: session.tokenHash,
          ip: session.ip,
          revoked: session.revoked,
          user_agent: session.userAgent,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return SessionWriteKyselyMapper.fromRawToAgr(newSession);
    });
  }
}
