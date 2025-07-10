export class UpdateRepeatableThingCommand {
  constructor(
    readonly input: {
      readonly id: number;
      readonly userId: number;
      readonly position: number;
      readonly name: string;
      readonly weekDays: number[];
      readonly description?: string;
      readonly priority?: number;
    },
  ) {}
}
