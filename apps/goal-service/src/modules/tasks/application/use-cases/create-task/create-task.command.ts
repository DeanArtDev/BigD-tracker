import { TaskRecurrenceValues } from '../../types';

export class CreateTaskCommand {
  constructor(
    readonly input: {
      readonly name: string;
      readonly userId: number;
      readonly groupId?: number;
      readonly description?: string;
      readonly priority?: number;
      readonly startDate?: string;
      readonly deadline?: string;
      readonly recurrence?: TaskRecurrenceValues;
    },
  ) {}
}
