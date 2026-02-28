import { TaskRecurrence } from '@/modules/tasks/domain';

export class UpdateInboxTaskCommand {
  constructor(
    readonly input: {
      readonly id: number;
      readonly name: string;
      readonly userId: number;
      readonly description?: string;
      readonly priority: number;
      readonly recurrence?: TaskRecurrence;
    },
  ) {}
}
