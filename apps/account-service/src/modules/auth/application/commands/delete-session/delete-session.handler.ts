import { AUTH_REPOSITORY, AuthRepository } from '@/modules/auth/application';
import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteSessionCommand } from './delete-session.command';

@CommandHandler(DeleteSessionCommand)
export class DeleteSessionHandler implements ICommandHandler<DeleteSessionCommand> {
  constructor(@Inject(AUTH_REPOSITORY) private readonly authRepo: AuthRepository) {}

  async execute(input: DeleteSessionCommand): Promise<boolean> {
    const session = await this.authRepo.findByUserId(input.ownerId);
    if (session == null) {
      throw new NotFoundException('Session does not exist');
    }

    return await this.authRepo.delete({ userId: input.ownerId, userAgent: input.userAgent });
  }
}
