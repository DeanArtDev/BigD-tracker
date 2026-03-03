export class SoftDeleteTaskCommand {
  constructor(
    readonly input: {
      readonly taskId: string;
      readonly userId: number;
    },
  ) {}
}
