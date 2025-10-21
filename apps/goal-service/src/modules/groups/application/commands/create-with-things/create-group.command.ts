export class CreateGroupWithThingsCommand {
  constructor(
    readonly input: {
      readonly userId: number;
      readonly name: string;
      readonly goalId?: number;
      readonly position?: number;
      readonly description?: string;
      readonly things: {
        readonly name: string;
        readonly description?: string;
        readonly priority?: number;
        readonly startDate?: string;
        readonly deadline?: string;
      }[];
    },
  ) {}
}
