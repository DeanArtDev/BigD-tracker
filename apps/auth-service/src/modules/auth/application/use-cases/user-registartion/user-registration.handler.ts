import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRegistrationCommand } from './user-registration.command';
import { UserRegistrationUseCase } from './user-registration.use-case';

@CommandHandler(UserRegistrationCommand)
export class UserRegistrationHandler implements ICommandHandler<UserRegistrationCommand> {
  constructor(private userRegistrationUseCase: UserRegistrationUseCase) {}

  async execute(
    command: UserRegistrationCommand,
  ): Promise<{ accessToken: string; refreshToken: string; maxAge: number }> {
    return await this.userRegistrationUseCase.execute(command);
  }
}
