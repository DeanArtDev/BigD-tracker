export class SoftDeleteTaskCommand {
  constructor(
    readonly input: {
      readonly taskId: number;
      readonly userId: number;
    },
  ) {}
}
