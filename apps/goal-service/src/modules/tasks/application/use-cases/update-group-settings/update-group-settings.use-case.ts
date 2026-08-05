import { GroupSettingsView } from '../../dto';
import { ExceptionGroupSettingsNotFound, ExceptionGroupWriteConflict } from '../../exceptions';
import { GroupsReadRepository, GroupsWriteRepository, TaskDatabase } from '../../ports';
import { GroupsToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { omitUndefined } from '@shared/utils';
import { UpdateGroupSettingsCommand } from './update-group-settings.command';

@Injectable()
class UpdateGroupSettingsUseCase {
  constructor(
    @Inject(GroupsToken.READ_REPOSITORY) private readonly groupsReadRepo: GroupsReadRepository,
    @Inject(GroupsToken.WRITE_REPOSITORY) private readonly groupsWriteRepo: GroupsWriteRepository,
    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
  ) {}

  execute({ input }: UpdateGroupSettingsCommand): Promise<GroupSettingsView> {
    return this.db.runTransaction(async (trx) => {
      const { groupId, userId, ...patch } = input;
      const currentSettings = await this.groupsReadRepo.getSettings({ groupId, userId }, trx);

      if (currentSettings == null) {
        throw new ExceptionGroupSettingsNotFound({ groupId });
      }

      const definedPatch = omitUndefined(patch);
      if (Object.keys(definedPatch).length === 0) return currentSettings;

      const updatedSettings = GroupSettingsView.restore({ ...currentSettings, ...definedPatch });
      if (currentSettings.isEqual(updatedSettings)) return currentSettings;

      const isUpdated = await this.groupsWriteRepo.updateSettings({ groupId, patch: definedPatch }, trx);

      if (!isUpdated) {
        throw new ExceptionGroupWriteConflict({
          subjectId: groupId,
          message: 'Group settings could not be updated',
        });
      }

      return updatedSettings;
    });
  }
}

export { UpdateGroupSettingsUseCase };
