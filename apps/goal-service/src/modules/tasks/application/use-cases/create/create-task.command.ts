export class CreateTaskCommand {
  constructor(
    readonly input: {
      readonly name: string;
      readonly userId: number;
      readonly groupId?: number;
      readonly description?: string;
      readonly priority?: number;
      readonly weight?: number;
      readonly startDate?: string;
      readonly deadline?: string;
      readonly recurrence?: string;
    },
  ) {}
}
