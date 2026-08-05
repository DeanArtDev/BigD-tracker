import { GroupsToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GroupSettingsView } from '../../dto';
import { ExceptionGroupSettingsNotFound } from '../../exceptions';
import { GroupsReadRepository, TaskDatabase } from '../../ports';
import { GetGroupSettingsQuery } from './get-group-settings.query';

@QueryHandler(GetGroupSettingsQuery)
export class GetGroupSettingsHandler implements IQueryHandler<GetGroupSettingsQuery> {
  constructor(
    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
    @Inject(GroupsToken.READ_REPOSITORY) private readonly groupsReadRepo: GroupsReadRepository,
  ) {}

  async execute({ input }: GetGroupSettingsQuery): Promise<GroupSettingsView> {
    return this.db.runTransaction(async (trx) => {
      const settings = await this.groupsReadRepo.getSettings(input, trx);

      if (settings == null) {
        throw new ExceptionGroupSettingsNotFound({ groupId: input.groupId });
      }

      return settings;
    });
  }
}
