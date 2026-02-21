import { UserCreatedEvent, UserDeletedEvent } from './domain';
import {
  CreateUserCommand,
  CreateUserHandler,
  UserMapper,
  GetUserQuery,
  GetUserHandler,
  USER_REPOSITORY,
  UsersController,
  DeleteUserCommand,
  DeleteUserHandler,
} from './application';
import { Module } from '@nestjs/common';
import { KyselyUsersRepository } from './infra/kysely-users.repository';

const commands = [CreateUserCommand, DeleteUserCommand];
const handlers = [CreateUserHandler, GetUserHandler, DeleteUserHandler];
const queries = [GetUserQuery];
const events = [UserCreatedEvent, UserDeletedEvent];

@Module({
  controllers: [UsersController],
  providers: [
    { provide: USER_REPOSITORY, useClass: KyselyUsersRepository },
    UserMapper,
    ...commands,
    ...handlers,
    ...queries,
    ...events,
  ],
  exports: [USER_REPOSITORY],
})
export class UsersModule {}
