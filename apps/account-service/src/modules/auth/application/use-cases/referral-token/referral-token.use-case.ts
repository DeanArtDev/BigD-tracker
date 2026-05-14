import { AUTH_REPOSITORY, AuthRepository } from '@/modules/auth/application';
import { ExceptionSessionExpired, ExceptionSessionNotFound, ExceptionUserNotFound } from '@/modules/auth/exceptions';
import { USER_REPOSITORY, UsersRepository } from '@/modules/users/application';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ReferralTokenCommand } from './referral-token.command';

@Injectable()
class ReferralTokenUseCase {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(USER_REPOSITORY) private readonly usersRepository: UsersRepository,
    @Inject(AUTH_REPOSITORY) private readonly authRepo: AuthRepository,
  ) {}

  async execute({ input }: ReferralTokenCommand): Promise<{ referralToken: string }> {
    const user = await this.usersRepository.findUserById({ id: input.userId });
    if (user == null) {
      throw new ExceptionUserNotFound({ userId: input.userId });
    }

    const session = await this.authRepo.findAnd({ userId: input.userId });
    if (session == null) {
      throw new ExceptionSessionNotFound({
        userId: input.userId,
      });
    }
    if (session.isExpired) {
      throw new ExceptionSessionExpired({
        userId: input.userId,
        message: 'Пользователь с истекшей сессией не может создать реферальный токен',
      });
    }

    return {
      referralToken: await this.jwtService.signAsync({ rid: input.userId }, { expiresIn: '1h' }),
    };
  }
}

export { ReferralTokenUseCase };
