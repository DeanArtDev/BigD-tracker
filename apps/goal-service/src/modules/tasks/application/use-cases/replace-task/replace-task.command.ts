import { TaskRecurrence } from '@/modules/tasks/domain';

export class ReplaceTaskCommand {
  constructor(
    readonly input: {
      readonly id: string;
      readonly name: string;
      readonly userId: number;
      readonly description?: string;
      readonly priority: number;
      readonly weight: number;
      readonly startDate?: string;
      readonly deadline?: string;
      readonly recurrence?: TaskRecurrence;
    },
  ) {}
}
