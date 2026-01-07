export class ReplaceTaskCommand {
  constructor(
    readonly input: {
      readonly id: number;
      readonly name: string;
      readonly userId: number;
      readonly description?: string;
      readonly priority: number;
      readonly weight: number;
      readonly startDate?: string;
      readonly deadline?: string;
      readonly recurrence?: string;
    },
  ) {}
}
