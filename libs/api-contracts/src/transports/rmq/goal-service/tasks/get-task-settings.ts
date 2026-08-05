import { GetTaskSettingsReq, GetTaskSettingsRes } from './dtos';

export namespace GoalGetTaskSettings {
  export const pattern = 'goal.get-task-settings.query';

  export class Request extends GetTaskSettingsReq {}

  export class Response extends GetTaskSettingsRes {}
}
