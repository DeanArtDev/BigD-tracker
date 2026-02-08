export class CreateTaskInInboxCommand {
  constructor(
    readonly input: {
      readonly name: string;
      readonly userId: number;
      readonly description?: string;
      readonly priority?: number;
      readonly deadline?: string;
    },
  ) {}
}
