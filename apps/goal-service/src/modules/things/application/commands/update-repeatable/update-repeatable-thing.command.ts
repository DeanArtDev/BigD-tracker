export class UpdateRepeatableThingCommand {
  constructor(
    readonly input: {
      readonly id: number;
      readonly userId: number;
      readonly name: string;
      readonly weekDays: number[];
      readonly description?: string;
      readonly priority?: number;
    },
  ) {}
}
