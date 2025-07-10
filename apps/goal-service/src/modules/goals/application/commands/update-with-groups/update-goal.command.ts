export class UpdateGoalCommand {
  constructor(
    readonly input: {
      readonly id: number;
      readonly userId: number;
      readonly name: string;
      readonly description?: string;
    },
  ) {}
}
