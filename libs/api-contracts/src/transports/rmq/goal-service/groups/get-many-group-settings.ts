import { GetManyGroupSettingsReq, GetManyGroupSettingsRes } from './dtos';

export namespace GoalGetManyGroupSettings {
  export const pattern = 'goal.get-many-group-settings.query';

  export class Request extends GetManyGroupSettingsReq {}

  export class Response extends GetManyGroupSettingsRes {}
}
