import { SessionTokenHash } from '@/modules/auth/domain/value-objects';
import { DateVo } from '@big-d/api-utils';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { ExceptionInvalidSession, ExceptionSessionNotFound } from '../../exceptions';
import { AuthDatabase } from '../../ports';
import { SessionService } from '../../services';
import { UserTokenRefreshCommand } from './user-token-refresh.command';

@Injectable()
class UserTokenRefreshUseCase {
  constructor(
    private readonly sessionService: SessionService,

    @Inject(databaseToken.CONNECTION) private readonly db: AuthDatabase,
  ) {}

  execute({ input }: UserTokenRefreshCommand): Promise<{ accessToken: string; maxAge: number }> {
    return this.db.runTransaction(async (trx) => {
      const { userAgent, userId, refreshToken, sessionId } = input;

      const session = await this.sessionService.getSessionById({ userId, sessionId }, trx);
      if (session == null) {
        throw new ExceptionSessionNotFound({ sessionId, userId });
      }

      if (session.isExpired(DateVo.now())) {
        throw new ExceptionInvalidSession({ message: 'Сессия истекла', sessionId, userId });
      }

      if (!this.sessionService.compareFingerprints({ userAgent: userAgent }, { userAgent: session.userAgent })) {
        throw new ExceptionInvalidSession({ message: 'Сессия привязана к другому устройству', sessionId, userId });
      }

      const sessionTokenHash = SessionTokenHash.create(session.tokenHash);
      const isTheSameTokens = await this.sessionService.compareHashAsync(sessionTokenHash, refreshToken);
      if (!isTheSameTokens) {
        throw new ExceptionInvalidSession({ message: 'Не валидный рефреш токен сессии', sessionId, userId });
      }

      const { accessToken } = await this.sessionService.createAccessToken({ userId, sessionId });

      return { accessToken, maxAge: this.sessionService.getSessionMaxAge().valueOf() };
    });
  }
}

export { UserTokenRefreshUseCase };
