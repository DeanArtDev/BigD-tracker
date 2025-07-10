export class UpdateGroupWithThingsCommand {
  constructor(
    readonly input: {
      readonly id: number;
      readonly userId: number;
      readonly name: string;
      readonly position?: number;
      readonly description?: string;
      readonly things: {
        readonly id?: number;
        readonly name: string;
        readonly description?: string;
        readonly priority?: number;
        readonly startDate?: string;
        readonly deadline?: string;
      }[];
    },
  ) {}
}
