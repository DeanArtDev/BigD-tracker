import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ReferralTokenCommand } from './referral-token.command';
import { ReferralTokenUseCase } from './referral-token.use-case';

@CommandHandler(ReferralTokenCommand)
export class ReferralTokenHandler implements ICommandHandler<ReferralTokenCommand> {
  constructor(private referralTokenUseCase: ReferralTokenUseCase) {}

  async execute(command: ReferralTokenCommand): Promise<{ referralToken: string }> {
    return await this.referralTokenUseCase.execute(command);
  }
}
