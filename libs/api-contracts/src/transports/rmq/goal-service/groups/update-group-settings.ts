import { UpdateGroupSettingsReq, UpdateGroupSettingsRes } from './dtos';

export namespace GoalUpdateGroupSettings {
  export const pattern = 'goal.update-group-settings.command';

  export class Request extends UpdateGroupSettingsReq {}

  export class Response extends UpdateGroupSettingsRes {}
}
