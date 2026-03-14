export class CloneTaskCommand {
  constructor(
    readonly input: {
      readonly userId: number;
      readonly taskId: string;
    },
  ) {}
}
