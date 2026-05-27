import { UserPasswordHash } from '@/modules/auth/domain/value-objects';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { ExceptionWrongLoginOrPassword } from '../../exceptions';
import { AuthDatabase, USERS_WRITE_REPOSITORY, UserWriteRepository } from '../../ports';
import { SessionService, UserPasswordService } from '../../services';
import { UserByEmail, usersCombinators } from '../../specifications';
import { UserLoginCommand } from './user-login.command';

const { and } = usersCombinators;

@Injectable()
class UserLoginUseCase {
  constructor(
    private readonly userPasswordService: UserPasswordService,
    private readonly sessionService: SessionService,

    @Inject(USERS_WRITE_REPOSITORY) private readonly userWriteRepo: UserWriteRepository,
    @Inject(databaseToken.CONNECTION) private readonly db: AuthDatabase,
  ) {}

  execute({ input }: UserLoginCommand): Promise<{ accessToken: string; refreshToken: string; maxAge: number }> {
    return this.db.runTransaction(async (trx) => {
      const { userAgent, ip, password, email } = input;

      const existedUser = await this.userWriteRepo.getOneUser(and(UserByEmail(email)));
      if (existedUser == null) {
        throw new ExceptionWrongLoginOrPassword({ message: 'Не верный логин или пароль' });
      }

      const isPasswordCorrect = await this.userPasswordService.compareAsync(
        UserPasswordHash.create(existedUser.passwordHash),
        password,
      );
      if (!isPasswordCorrect) {
        throw new ExceptionWrongLoginOrPassword({ message: 'Не верный логин или пароль' });
      }

      await this.sessionService.deleteSessionByFingerprint({ userId: existedUser.id, userAgent }, trx);

      const { accessToken, refreshToken } = await this.sessionService.createSession(
        { userId: existedUser.id, userAgent, ip },
        trx,
      );

      return { accessToken, refreshToken, maxAge: this.sessionService.getSessionMaxAge().valueOf() };
    });
  }
}

export { UserLoginUseCase };
