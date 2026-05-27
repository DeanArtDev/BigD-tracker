import { DateVo } from '@big-d/api-utils';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { ExceptionInvalidSession, ExceptionUserNotDeleted, ExceptionUserNotFound } from '../../exceptions';
import { AuthDatabase, USERS_WRITE_REPOSITORY, UserWriteRepository } from '../../ports';
import { SessionService } from '../../services';
import { UserById, usersCombinators } from '../../specifications';
import { UserDeleteCommand } from './user-delete.command';

const { and } = usersCombinators;

@Injectable()
class UserDeleteUseCase {
  constructor(
    private readonly sessionService: SessionService,

    @Inject(USERS_WRITE_REPOSITORY) private readonly userWriteRepo: UserWriteRepository,
    @Inject(databaseToken.CONNECTION) private readonly db: AuthDatabase,
  ) {}

  execute({ input }: UserDeleteCommand): Promise<{ id: number }> {
    return this.db.runTransaction(async (trx) => {
      const { userId, userAgent } = input;

      const user = await this.userWriteRepo.getOneUser(and(UserById(userId)));
      if (user == null) {
        throw new ExceptionUserNotFound({ userId });
      }

      const userSessions = await this.sessionService.getSessionsByUserId({ userId }, trx);

      if (userSessions.every((s) => s.revoked || s.isExpired(DateVo.now()))) {
        throw new ExceptionInvalidSession({ message: 'У пользователя нет ни одной активной сессии', userId });
      }

      const currentDeviseSession = userSessions.find(
        (s) =>
          !s.revoked &&
          !s.isExpired(DateVo.now()) &&
          this.sessionService.compareFingerprints({ userAgent }, { userAgent: s.userAgent }),
      );

      if (currentDeviseSession == null) {
        throw new ExceptionInvalidSession({ message: 'У пользователя нет сессии для этого девайса', userId });
      }

      const deletedCount = await this.userWriteRepo.delete(and(UserById(userId)), trx);
      if (deletedCount <= 0) {
        throw new ExceptionUserNotDeleted({ userId });
      }

      return { id: userId };
    });
  }
}

export { UserDeleteUseCase };
