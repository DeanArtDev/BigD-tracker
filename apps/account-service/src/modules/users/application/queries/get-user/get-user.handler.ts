import { UserEntity } from '@/modules/users/domain';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { USER_REPOSITORY, UsersRepository } from '../../users.repository';
import { GetUserQuery } from './get-user.query';

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
  constructor(@Inject(USER_REPOSITORY) private readonly usersRepository: UsersRepository) {}

  async execute({ input }: GetUserQuery): Promise<UserEntity | null> {
    if ('id' in input) {
      return await this.usersRepository.findUserById({ id: input.id });
    }
    if ('email' in input) {
      return await this.usersRepository.findUserByEmail({ email: input.email });
    }
    if ('screenName' in input) {
      return await this.usersRepository.findUserByScreeName({ screenName: input.screenName });
    }
    return null;
  }
}
