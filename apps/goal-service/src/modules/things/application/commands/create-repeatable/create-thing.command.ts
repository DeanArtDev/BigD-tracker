export class CreateThingCommand {
  constructor(
    readonly input: {
      readonly userId: number;
      readonly name: string;
      readonly groupId: number;
      readonly description?: string;
      readonly priority?: number;
      readonly startDate?: string;
      readonly deadline?: string;
    },
  ) {}
}
