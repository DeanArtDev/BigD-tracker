import { UpdateTaskSettingsReq, UpdateTaskSettingsRes } from './dtos';

export namespace GoalUpdateTaskSettings {
  export const pattern = 'goal.update-task-settings.command';

  export class Request extends UpdateTaskSettingsReq {}

  export class Response extends UpdateTaskSettingsRes {}
}
