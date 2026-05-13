import { databaseToken } from '@big-d/database';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserView } from '../../dto';
import { AuthDatabase } from '../../ports';
import { UserCheckerService } from '../../services';
import { GetMeQuery } from './get-me.query';

@QueryHandler(GetMeQuery)
export class GetMeHandler implements IQueryHandler<GetMeQuery> {
  constructor(
    private readonly userCheckerService: UserCheckerService,

    @Inject(databaseToken.CONNECTION) private readonly db: AuthDatabase,
  ) {}

  async execute({ input }: GetMeQuery): Promise<UserView> {
    return this.db.runTransaction(async (trx) => {
      return await this.userCheckerService.ensureUserExists({ userId: input.userId }, { trx });
    });
  }
}
