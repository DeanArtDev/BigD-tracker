import { AUTH_REPOSITORY, AuthRepository } from '@/modules/auth/application';
import { SessionEntity } from '@/modules/auth/domain';
import { GetSessionQuery } from './get-session.query';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

@QueryHandler(GetSessionQuery)
export class GetSessionHandler implements IQueryHandler<GetSessionQuery> {
  constructor(@Inject(AUTH_REPOSITORY) private readonly authRepo: AuthRepository) {}

  async execute({ input }: GetSessionQuery): Promise<SessionEntity | null> {
    return 'token' in input ? await this.authRepo.findByToken(input.token) : await this.authRepo.findAnd(input);
  }
}
