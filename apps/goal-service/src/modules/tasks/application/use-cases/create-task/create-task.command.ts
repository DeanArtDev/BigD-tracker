import { TaskRecurrence } from '@/modules/tasks/domain';

export class CreateTaskCommand {
  constructor(
    readonly input: {
      readonly name: string;
      readonly userId: number;
      readonly groupId?: number;
      readonly description?: string;
      readonly priority?: number;
      readonly weight?: number;
      readonly recurrence?: TaskRecurrence;
    },
  ) {}
}
