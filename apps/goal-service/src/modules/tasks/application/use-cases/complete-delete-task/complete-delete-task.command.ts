export class CompleteDeleteTaskCommand {
  constructor(
    readonly input: {
      readonly taskId: number;
      readonly userId: number;
    },
  ) {}
}
