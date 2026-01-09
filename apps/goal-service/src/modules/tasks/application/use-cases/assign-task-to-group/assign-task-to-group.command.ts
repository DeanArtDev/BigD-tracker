export class AssignTaskToGroupCommand {
  constructor(
    readonly input: {
      readonly userId: number;
      readonly taskId: number;
      readonly groupId: number;
    },
  ) {}
}
