export class CreateGoalCommand {
  constructor(
    readonly input: {
      readonly userId: number;
      readonly name: string;
      readonly description?: string;
    },
  ) {}
}
