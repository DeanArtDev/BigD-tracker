export class FinishThingCommand {
  constructor(
    readonly input: {
      readonly id: number;
      readonly userId: number;
      readonly endDate: string;
      readonly comment?: string;
      readonly result: number;
    },
  ) {}
}
