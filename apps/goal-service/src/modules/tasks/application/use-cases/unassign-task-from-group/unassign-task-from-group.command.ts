export class UnassignTaskFromGroupCommand {
  constructor(
    readonly input: {
      readonly userId: number;
      readonly taskId: number;
      readonly groupId: number;
    },
  ) {}
}
