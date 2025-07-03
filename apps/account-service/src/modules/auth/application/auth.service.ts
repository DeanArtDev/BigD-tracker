import { AUTH_REPOSITORY, AuthRepository } from './auth.repository';
import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class AuthService {
  constructor(@Inject(AUTH_REPOSITORY) private readonly authRepo: AuthRepository) {}

  /*https://docs.nestjs.com/techniques/task-scheduling*/
  @Cron('0 0 * * * *', { timeZone: 'UTC' })
  async cronSessionDelete() {
    await this.authRepo.deleteExpired();
  }
}
