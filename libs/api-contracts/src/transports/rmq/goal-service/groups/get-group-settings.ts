import { GetGroupSettingsReq, GetGroupSettingsRes } from './dtos';

export namespace GoalGetGroupSettings {
  export const pattern = 'goal.get-group-settings.query';

  export class Request extends GetGroupSettingsReq {}

  export class Response extends GetGroupSettingsRes {}
}
