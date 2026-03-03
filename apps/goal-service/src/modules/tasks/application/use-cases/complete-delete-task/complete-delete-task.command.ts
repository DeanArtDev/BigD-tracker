export class CompleteDeleteTaskCommand {
  constructor(
    readonly input: {
      readonly taskId: string;
      readonly userId: number;
    },
  ) {}
}
