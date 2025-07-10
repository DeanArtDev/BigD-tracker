import { Inject, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { USER_REPOSITORY, UsersRepository } from '../../users.repository';
import { DeleteUserCommand } from './delete-user.command';

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  constructor(@Inject(USER_REPOSITORY) private readonly usersRepository: UsersRepository) {}

  async execute(input: DeleteUserCommand): Promise<{ id: number }> {
    const existedUser = await this.usersRepository.findUserById({ id: input.id });
    if (existedUser == null) {
      throw new NotFoundException(`User ${input.id} is not found`);
    }

    if (!(await this.usersRepository.delete(existedUser.id))) {
      throw new InternalServerErrorException('Failed to delete training template');
    }

    return { id: input.id };
  }
}
