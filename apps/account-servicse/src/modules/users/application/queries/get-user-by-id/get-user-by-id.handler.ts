import { RpcException } from '@nestjs/microservices';
import { USER_REPOSITORY, UsersRepository } from '../../users.repository';
import { UserEntity } from '@/modules/users/domain';
import { HttpStatus, Inject } from '@nestjs/common';
import { GetUserByIdQuery } from './get-user-by-id.query';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

@QueryHandler(GetUserByIdQuery)
export class GetUserHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(@Inject(USER_REPOSITORY) private readonly usersRepository: UsersRepository) {}

  async execute(input: GetUserByIdQuery): Promise<UserEntity> {
    const user = await this.usersRepository.findUserById({ id: input.id });
    if (!user) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `User: ${input.id} not found`,
      });
    }
    return user;
  }
}
