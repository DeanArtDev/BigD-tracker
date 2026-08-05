import { GroupSettingsViewPatch } from '../../dto';

type UpdateGroupSettingsPatch = GroupSettingsViewPatch;

class UpdateGroupSettingsCommand {
  constructor(
    readonly input: {
      readonly groupId: number;
      readonly userId: number;
    } & UpdateGroupSettingsPatch,
  ) {}
}

export { UpdateGroupSettingsCommand, UpdateGroupSettingsPatch };
