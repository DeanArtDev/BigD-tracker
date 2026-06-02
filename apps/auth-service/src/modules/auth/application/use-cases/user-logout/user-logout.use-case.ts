import { RpcStatus } from '@big-d/api-contracts';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { ExceptionUserNotFound } from '../../exceptions';
import { AuthDatabase, USERS_WRITE_REPOSITORY, UserWriteRepository } from '../../ports';
import { SessionService } from '../../services';
import { UserById, usersCombinators } from '../../specifications';
import { UserLogoutCommand } from './user-logout.command';

const { and } = usersCombinators;

@Injectable()
class UserLogoutUseCase {
  constructor(
    private readonly sessionService: SessionService,

    @Inject(USERS_WRITE_REPOSITORY) private readonly userWriteRepo: UserWriteRepository,
    @Inject(databaseToken.CONNECTION) private readonly db: AuthDatabase,
  ) {}

  execute({ input }: UserLogoutCommand): Promise<{ status: RpcStatus }> {
    return this.db.runTransaction(async (trx) => {
      const { userAgent, userId } = input;

      const user = await this.userWriteRepo.getOneUser(and(UserById(userId)));
      if (user == null) {
        throw new ExceptionUserNotFound({ userId });
      }

      const isDeleted = await this.sessionService.deleteSessionByFingerprint({ userId: user.id, userAgent }, trx);

      return { status: isDeleted ? RpcStatus.SUCCESS : RpcStatus.FAILED };
    });
  }
}

export { UserLogoutUseCase };
