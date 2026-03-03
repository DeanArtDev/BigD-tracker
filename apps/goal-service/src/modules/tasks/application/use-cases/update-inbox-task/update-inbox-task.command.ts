export class UpdateInboxTaskCommand {
  constructor(
    readonly input: {
      readonly id: string;
      readonly name: string;
      readonly userId: number;
      readonly description?: string;
      readonly priority: number;
      readonly startDate?: string;
      readonly deadline?: string;
    },
  ) {}
}
