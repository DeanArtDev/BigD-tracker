import { GroupInboxView, GroupSettingsView } from '@/modules/tasks/application/dto';
import { TaskDatabase, GroupInboxWriteRepository, TaskTransaction } from '@/modules/tasks/application/ports';
import { INBOX_GROUP_NAME } from '@/modules/tasks/domain/constants';
import { GroupStatus } from '@big-d/api-contracts';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { GroupReadKyselyMapper } from '../../mappers/groups.read-mapper';
import { BaseTasksRepository } from '../base-tasks.repository';

@Injectable()
export class GroupInboxWriteRepositoryKysely extends BaseTasksRepository implements GroupInboxWriteRepository {
  constructor(@Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase) {
    super();
  }

  async createInbox(input: { userId: number }, trx?: TaskTransaction): Promise<GroupInboxView> {
    return await this.errorCatcher('group-inbox.inbox-creation', async () => {
      const groupStatus = await this.db
        .qb(trx)
        .selectFrom('group_statuses')
        .where('name', '=', GroupStatus.IN_PROGRESS)
        .select(['id', 'name'])
        .executeTakeFirstOrThrow();

      const result = await this.db
        .qb(trx)
        .insertInto('groups')
        .values({
          name: INBOX_GROUP_NAME,
          user_id: input.userId,
          status_id: groupStatus.id,
        })
        .returning(['id', 'name', 'user_id'])
        .executeTakeFirstOrThrow();

      const settings = GroupSettingsView.create({ groupId: result.id });

      await this.db
        .qb(trx)
        .insertInto('group_settings')
        .values({
          group_id: settings.groupId,
          event_color: settings.eventColor,
          event_selected_color: settings.eventSelectedColor,
          line_color: settings.lineColor,
          text_color: settings.textColor,
          event_color_dark: settings.eventColorDark,
          event_selected_color_dark: settings.eventSelectedColorDark,
          line_color_dark: settings.lineColorDark,
          text_color_dark: settings.textColorDark,
          is_default: settings.isDefault,
          is_visible: settings.isVisible,
          is_readonly: settings.isReadonly,
        })
        .executeTakeFirstOrThrow();

      return GroupReadKyselyMapper.fromRawToInboxView({
        id: result.id,
        name: result.name,
        user_id: result.user_id,
        task_count: 0,
      });
    });
  }
}
