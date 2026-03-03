import { Email } from '@big-d/api-utils';
import { ConflictException, Inject, InternalServerErrorException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UserCreatedEvent, UserEntity, UserPassword } from '../../../domain';
import { USER_REPOSITORY, UsersRepository } from '../../users.repository';
import { CreateUserCommand } from './create-user.command';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly usersRepository: UsersRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(input: CreateUserCommand) {
    const existedUser = await this.usersRepository.findUserByEmail({ email: input.email });
    if (existedUser != null) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await UserPassword.create(input.password);
    const draftUser = UserEntity.create({
      passwordHash,
      email: Email.create(input.email),
    });

    const newUser = await this.usersRepository.create(draftUser);

    if (newUser == null) {
      throw new InternalServerErrorException({ email: input.email }, { cause: 'User was not created' });
    }

    this.eventBus.publish(new UserCreatedEvent(newUser.id));

    return { userId: newUser.id };
  }
}
