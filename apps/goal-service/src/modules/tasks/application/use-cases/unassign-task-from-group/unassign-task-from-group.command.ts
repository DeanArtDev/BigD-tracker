export class UnassignTaskFromGroupCommand {
  constructor(
    readonly input: {
      readonly userId: number;
      readonly taskId: string;
      readonly groupId: number;
    },
  ) {}
}
