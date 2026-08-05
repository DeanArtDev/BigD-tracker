import { TaskSettingsViewPatch } from '../../dto';

type UpdateTaskSettingsPatch = TaskSettingsViewPatch;

class UpdateTaskSettingsCommand {
  constructor(
    readonly input: {
      readonly taskId: string;
      readonly userId: number;
    } & UpdateTaskSettingsPatch,
  ) {}
}

export { UpdateTaskSettingsCommand, UpdateTaskSettingsPatch };
