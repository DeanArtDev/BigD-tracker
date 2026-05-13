import { UserFactory } from '@/modules/auth/domain/aggreates';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { ExceptionUserAlreadyExist } from '../../exceptions';
import {
  AuthDatabase,
  UserReadRepository,
  USERS_READ_REPOSITORY,
  USERS_WRITE_REPOSITORY,
  UserWriteRepository,
} from '../../ports';
import { SessionService, UserPasswordService } from '../../services';
import { UserByEmail, usersCombinators } from '../../specifications';
import { UserRegistrationCommand } from './user-registration.command';

const { and } = usersCombinators;

@Injectable()
class UserRegistrationUseCase {
  constructor(
    private readonly userPasswordService: UserPasswordService,
    private readonly sessionService: SessionService,

    @Inject(USERS_READ_REPOSITORY) private readonly userReadRepo: UserReadRepository,
    @Inject(USERS_WRITE_REPOSITORY) private readonly userWriteRepository: UserWriteRepository,
    @Inject(databaseToken.CONNECTION) private readonly db: AuthDatabase,
  ) {}

  async execute({
    input,
  }: UserRegistrationCommand): Promise<{ accessToken: string; refreshToken: string; maxAge: number }> {
    return this.db.runTransaction(async (trx) => {
      const { userAgent, ip, password, email } = input;

      const existedUser = await this.userReadRepo.getOneUser(and(UserByEmail(email)));
      if (existedUser != null) {
        throw new ExceptionUserAlreadyExist({ email });
      }

      const passwordHash = await this.userPasswordService.createHashAsync(password);
      const userDraft = UserFactory.create({ email, passwordHash });
      const newUser = await this.userWriteRepository.create(userDraft, trx);

      const { accessToken, refreshToken, maxAge } = await this.sessionService.createSession(
        { userId: newUser.id, userAgent, ip },
        trx,
      );

      return { accessToken, refreshToken, maxAge };
    });
  }
}

export { UserRegistrationUseCase };
