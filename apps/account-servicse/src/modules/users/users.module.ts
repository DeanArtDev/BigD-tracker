import {
  CreateUserCommand,
  CreateUserHandler,
  UserMapper,
  GetUserByIdQuery,
  GetUserHandler,
  USER_REPOSITORY,
  UsersController,
} from './application';
import { Module } from '@nestjs/common';
import { KyselyUsersRepository } from './infra/kysely-users.repository';

const userCommands = [CreateUserCommand];
const userCommandHandlers = [CreateUserHandler];

const userQueries = [GetUserByIdQuery];
const userQueryHandlers = [GetUserHandler];

@Module({
  controllers: [UsersController],
  providers: [
    { provide: USER_REPOSITORY, useClass: KyselyUsersRepository },
    UserMapper,
    ...userCommands,
    ...userCommandHandlers,
    ...userQueries,
    ...userQueryHandlers,
  ],
})
export class UsersModule {}
