export class UpdateThingCommand {
  constructor(
    readonly input: {
      readonly id: number;
      readonly userId: number;
      readonly name: string;
      readonly position: number;
      readonly description?: string;
      readonly priority?: number;
      readonly startDate?: string;
      readonly deadline?: string;
    },
  ) {}
}
