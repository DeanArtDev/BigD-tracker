import { SessionFactory, UserFactory } from '@/modules/auth/domain/aggreates';
import { DateVo, timeAndDate } from '@big-d/api-utils';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import ms from 'ms';
import {
  AuthDatabase,
  SESSIONS_WRITE_REPOSITORY,
  SessionWriteRepository,
  UserReadRepository,
  USERS_READ_REPOSITORY,
  USERS_WRITE_REPOSITORY,
  UserWriteRepository,
} from '../../ports';
import { SessionTokenService, UserPasswordService } from '../../services';
import { UserByEmail, usersCombinators } from '../../specifications';
import { UserRegistrationCommand } from './user-registration.command';
import { ExceptionUserAlreadyExist } from '../../exceptions';

const { and } = usersCombinators;

@Injectable()
class UserRegistrationUseCase {
  constructor(
    private readonly jwtService: JwtService,

    private readonly userPasswordService: UserPasswordService,
    private readonly sessionTokenService: SessionTokenService,
    private readonly configService: ConfigService,

    @Inject(USERS_READ_REPOSITORY) private readonly userReadRepo: UserReadRepository,
    @Inject(SESSIONS_WRITE_REPOSITORY) private readonly sessionWriteRepositoryKysely: SessionWriteRepository,
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

      const token = crypto.randomUUID();
      const tokenHash = await this.sessionTokenService.createHashAsync(token);
      const maxAge = timeAndDate()
        .add(ms(this.configService.getOrThrow('auth.REFRESH_EXPIRE_TIME')), 'milliseconds')
        .toISOString();

      const sessionDraft = SessionFactory.create({
        ip,
        userAgent,
        tokenHash,
        userId: newUser.id,
        expiresAt: DateVo.format(maxAge),
      });
      const session = await this.sessionWriteRepositoryKysely.create(sessionDraft, trx);

      const accessToken = await this.jwtService.signAsync({
        uid: newUser.id,
        sid: session.id,
        expiresAt: this.configService.getOrThrow('auth.ACCESS_EXPIRE_TIME'),
      });

      return { accessToken, refreshToken: session.tokenHash, maxAge: timeAndDate(maxAge).valueOf() };
    });
  }
}

export { UserRegistrationUseCase };
