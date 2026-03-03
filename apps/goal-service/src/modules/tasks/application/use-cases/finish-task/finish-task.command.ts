export class FinishTaskCommand {
  constructor(
    readonly input: {
      readonly userId: number;
      readonly taskId: string;
    },
  ) {}
}
