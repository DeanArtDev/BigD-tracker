import { TaskRecurrence } from '@/modules/tasks/domain';

export class ReplaceGroupCommand {
  constructor(
    readonly input: {
      readonly id: number;
      readonly name: string;
      readonly userId: number;
      readonly description?: string;
      readonly tasks: {
        readonly id: string;
        readonly name: string;
        readonly description?: string;
        readonly weight: number;
        readonly startDate?: string;
        readonly deadline?: string;
        readonly priority: number;
        readonly recurrence?: TaskRecurrence;
      }[];
    },
  ) {}
}
