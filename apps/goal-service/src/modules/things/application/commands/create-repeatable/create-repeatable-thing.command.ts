export class CreateRepeatableThingCommand {
  constructor(
    readonly input: {
      readonly groupId: number;
      readonly userId: number;
      readonly name: string;
      readonly description?: string;
      readonly priority?: number;
      readonly weekDays: number[];
    },
  ) {}
}
