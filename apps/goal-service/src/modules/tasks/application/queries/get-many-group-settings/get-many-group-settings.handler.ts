import { GroupsToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GroupSettingsView } from '../../dto';
import { GroupsReadRepository, TaskDatabase } from '../../ports';
import { GetManyGroupSettingsQuery } from './get-many-group-settings.query';

@QueryHandler(GetManyGroupSettingsQuery)
class GetManyGroupSettingsHandler implements IQueryHandler<GetManyGroupSettingsQuery> {
  constructor(
    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
    @Inject(GroupsToken.READ_REPOSITORY) private readonly groupsReadRepository: GroupsReadRepository,
  ) {}

  execute({ input }: GetManyGroupSettingsQuery): Promise<GroupSettingsView[]> {
    return this.db.runTransaction((trx) => this.groupsReadRepository.getManySettings(input, trx));
  }
}

export { GetManyGroupSettingsHandler };
